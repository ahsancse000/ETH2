// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

contract Audit {
    //states
    struct Auditor {
        string category;
        string email;
        address _auditor;
        uint currentGigs;
        bool isConfirmed;
        uint256 confirmationTime;
        AuditorContracts[] contractsAddress;
    }

    struct AuditorContracts {
        address contractInstance;
        uint id;
    }

    Auditor[] private auditors;
    mapping(address => Auditor) public auditor_;
    mapping(address => bool) private _auditorAdmins;

    uint256 public auditorsCount;

    address _governanceContract;
    address private selectedAuditor;

    address[] _auditorsTobeSelected;

    //events
    event AuditorSelected(address indexed selectedAuditor);

    // Custom errors
    error ZeroAddress();

    constructor() {
        _auditorAdmins[msg.sender] = true;
        _governanceContract = msg.sender;
    }

    //modifiers

    function becomeAuditor(
        string memory _category,
        string memory _email
    ) public {
        Auditor storage newAuditor = auditor_[msg.sender];
        newAuditor.category = _category;
        newAuditor.email = _email;
        newAuditor._auditor = msg.sender;
        newAuditor.currentGigs = 0;
        newAuditor.isConfirmed = false;
        newAuditor.confirmationTime = 0;
        // newAuditor.contractsAddress = new AuditorContracts[](0);

        auditors.push(newAuditor);
    }

    function getAuditorByCategory(
        string memory _category,
        uint256 ranNum
    ) external returns (address) {
        selectedAuditor = _governanceContract;
        for (uint256 i = 0; i < auditorsCount; ++i) {
            if (
                (keccak256(
                    abi.encodePacked(auditor_[auditors[i]._auditor].category)
                ) == keccak256(abi.encodePacked(_category))) &&
                (auditor_[auditors[i]._auditor].currentGigs < 2) &&
                (auditor_[auditors[i]._auditor].isConfirmed)
            ) {
                _auditorsTobeSelected.push(
                    auditor_[auditors[i]._auditor]._auditor
                );
            }
        }

        if (_auditorsTobeSelected.length > 0) {
            if (_auditorsTobeSelected.length == 1) {
                selectedAuditor = _auditorsTobeSelected[0];
            } else {
                uint indexTo = ranNum % _auditorsTobeSelected.length;
                selectedAuditor = _auditorsTobeSelected[indexTo];
            }
        }
        _auditorsTobeSelected = new address[](0);
        emit AuditorSelected(selectedAuditor);
        return selectedAuditor;
    }

    function returnSelectedAuditor() external view returns (address) {
        return selectedAuditor;
    }

    function allAuditors() external view returns (Auditor[] memory _auditors) {
        _auditors = auditors;
    }
}
