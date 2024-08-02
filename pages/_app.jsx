import { useState, useEffect } from "react";
import { ethers } from "ethers";
import audit_abi from "../abi/assessment.json";
import "./index.css"

const App = () => {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("Smart Contract Writing");
  const [audit, setAudit] = useState(undefined);
  const [freelancers, setFreelancers] = useState([]);
  const [balance, setBalance] = useState(undefined);
  const [getAuditorLoading, setGetAuditorLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [randomForm, setRandomForm] = useState(false);
  const [addingLoading, setAddingLoading] = useState(false);
  const [address, setAddress] = useState()

  const contractAddress = "0x4E6350F09783DeB19DcCA9f85F09014F1a8EF644";
  const auditABI = audit_abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      setAccount(account);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getAuditContract();
  };

  const getAuditContract = async () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    setAddress(await signer.getAddress())
    const auditContract = new ethers.Contract(contractAddress, auditABI, signer);
    setAudit(auditContract);
  }

  const auditorsCount = async () => {
    if (audit) {
      const count = await audit.allAuditors();
      setBalance(count?.length);
      setFreelancers(count)
      // setWithdrawLoading(false);
      // setDepositLoading(false);
    }
  }

  const addAuditor = async () => {
    if (audit) {
      setAddingLoading(true);
      try {
        let tx = await audit.becomeAuditor(category, email);
        await tx.wait()
        setFreelancers([...freelancers, { email, category, address }])
        setAddingLoading(false)
      } catch (error) {
        setAddingLoading(false);
      }
    }
  }
  const getAuditor = async () => {
    if (audit) {
      setGetAuditorLoading(true);
      try {
        let tx = await audit.getAuditorByCategory(category, 12456);
        await tx.wait()
        const freelancer = await audit.returnSelectedAuditor()
        alert(`Your Selected Freelancer is ${freelancer}`)
        setGetAuditorLoading(false)
      } catch (error) {
        setAddingLoading(false);
      }
    }
  }

  useEffect(() => { getWallet(); }, []);


  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p className="install_button">Please install Metamask in order to use this DAPP.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button className="connect" style={{ backgroundColor: "purple", padding: "10px", color: "white", border: "none", borderRadius: "5px", textAlign: "center" }} onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance === undefined && account !== undefined) {
      auditorsCount();
    }

    return (
      <div style={{ fontFamily: "sans-serif" }}>
        <div className="navbar bg-base-100 header">
          <a className="btn btn-ghost text-xl" style={{ fontSize: "20px" }}>auditorsChain</a>
          <p className="text-red-600">Your Account: {account}</p>
        </div>
        <div style={{ margin: "auto" }}>
          <p className="balance" style={{ display: "block", textAlign: "center", fontSize: "25px" }}>Total Freelancers: {balance}</p>

          {/* Become an auditor */}
          {showForm &&
            <div className="container">
              <div>

                <label htmlFor="category">Category</label>
                <select onChange={(e) => setCategory(e.target.value)}>
                  <option value="Smart Contract Writing">Smart Contract Writing</option>
                  <option value="Content Writing">Content Writing</option>
                  <option value="Video Edit">Video Edit</option>
                  <option value="Web Development">Web Development</option>
                </select>

                <label htmlFor="email">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" id="email" name="email" placeholder="Your valid email" />

                <input disabled={addingLoading} type="submit" value={addingLoading ? "Processing" : "Submit"} onClick={() => addAuditor()} />

              </div>
            </div>
          }

          {/* Get an auditor */}
          {randomForm &&
            <div className="container">
              <div>

                <label htmlFor="category">Category</label>
                <select onChange={(e) => setCategory(e.target.value)}>
                  <option value="Smart Contract Writing">Smart Contract Writing</option>
                  <option value="Content Writing">Content Writing</option>
                  <option value="Video Edit">Video Edit</option>
                  <option value="Web Development">Web Development</option>
                </select>

                <input type="submit" disabled={getAuditorLoading} value={getAuditorLoading ? "Processing" : "Submit"} onClick={() => getAuditor()} />

              </div>
            </div>
          }

          <div className="" style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
            <button disabled={getAuditorLoading || addingLoading} style={{ backgroundColor: "#04AA6D", padding: "15px", color: "white", border: "none", borderRadius: "5px" }} onClick={() => { setShowForm(!showForm); setRandomForm(false) }}>{showForm ? "Close Form" : "Become A Freelancer"}</button>
            <button disabled={getAuditorLoading || addingLoading} style={{ backgroundColor: "#04AA6D", padding: "15px", color: "white", border: "none", borderRadius: "5px" }} onClick={() => { setRandomForm(!randomForm); setShowForm(false) }}>{randomForm ? "Cancel" : "Get A Freelancer By Category"}</button>
          </div>

          {/* Table */}
          <h1>All Freelancers</h1>

          <table id="customers">
            <tr>
              <th>Email</th>
              <th>Category</th>
              <th>Address</th>
            </tr>
            {freelancers.length > 0 && freelancers?.map((freelancer, index) => (
              <tr key={index}>
                <td>{freelancer[1]}</td>
                <td>{freelancer[0]}</td>
                <td>{freelancer[2]}</td>
              </tr>
            ))}
            {/* <tr>
              <td>Berglunds snabbköp</td>
              <td>Christina Berglund</td>
            </tr> */}
          </table>
        </div>
      </div>
    )
  }

  return (
    <main>
      {initUser()}
    </main>
  )


}

export default App