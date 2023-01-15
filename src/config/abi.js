export const sep20 = [
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function decimals() external view returns (uint8)',
  'function totalSupply() external view returns (uint256)',
  'function balanceOf(address _owner) external view returns (uint256 balance)',
  'function owner() external view returns (address)',
  'function transfer(address _to, uint256 _value) external returns (bool success)',
  'function transferFrom(address _from, address _to, uint256 _value) external returns (bool success)',
  'function approve(address _spender, uint256 _value) external returns (bool success)',
  'function allowance(address _owner, address _spender) external view returns (uint256 remaining)',
  'function decreaseAllowance(address _spender, uint256 _delta) external returns (bool success)',

  'event Transfer(address indexed _from, address indexed _to, uint256 _value)',
  'event Approval(address indexed _owner, address indexed _spender, uint256 _value)',
]

export const erc721Base = [
  'event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId)',
  'event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId)',
  'event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved)',

  'function balanceOf(address _owner) external view returns (uint256)',
  'function ownerOf(uint256 _tokenId) external view returns (address)',
  'function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data) external payable',
  'function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable',
  'function transferFrom(address _from, address _to, uint256 _tokenId) external payable',
  'function approve(address _approved, uint256 _tokenId) external payable',
  'function setApprovalForAll(address _operator, bool _approved) external',
  'function getApproved(uint256 _tokenId) external view returns (address)',
  'function isApprovedForAll(address _owner, address _operator) external view returns (bool)',
]

export const erc165 = [
  'function supportsInterface(bytes4 interfaceID) external view returns (bool)'
]

export const erc721Metadata = [
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function tokenURI(uint256 _tokenId) external view returns (string)',
]

export const erc721Enumerable = [
  'function totalSupply() external view returns (uint256)',
  'function tokenByIndex(uint256 _index) external view returns (uint256)',
  'function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256)',
]

// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-137.md
export const eip137 = [
  'function owner(bytes32 node) constant returns (address)',
  'function resolver(bytes32 node) constant returns (address)',
  'function ttl(bytes32 node) constant returns (uint64)',

  'function setOwner(bytes32 node, address owner)',
  'function setSubnodeOwner(bytes32 node, bytes32 label, address owner)',
  'function setResolver(bytes32 node, address resolver)',
  'function setTTL(bytes32 node, uint64 ttl)',

  'function supportsInterface(bytes4 interfaceID) constant returns (bool)',

  'function addr(bytes32 node) constant returns (address)',

  'event AddrChanged(bytes32 indexed node, address a)',
]

export const erc721 = [
  ...erc721Base,
  ...erc165,
  ...erc721Metadata,
  ...erc721Enumerable,
]
