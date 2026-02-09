// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract AcademicNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    
    struct Certificate {
        string title;      
        string issuer;
        uint256 grade;     
        uint256 issueDate; 
    }

    mapping(uint256 => Certificate) public certificates;

    constructor() ERC721("AcademicCertificate", "ACERT") Ownable(msg.sender) {}

    function issueCertificate(
        address student,
        string memory title,
        string memory issuer,
        uint256 grade,
        string memory tokenURI
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        
        _safeMint(student, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        certificates[tokenId] = Certificate(
            title,
            issuer,
            grade,
            block.timestamp
        );
        
        return tokenId;
    }
    

}