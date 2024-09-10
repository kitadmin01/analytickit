import json
from collections import defaultdict
from datetime import datetime

# Existing function signatures for various token standards
ERC721_FUNCTION_SIGNATURES = ['80ac58cd', '5b5e139f', '95d89b41', '6352211e']
ERC1155_FUNCTION_SIGNATURES = ['d9b67a26', '0e89341c', '4e2312e0']
ERC998_FUNCTION_SIGNATURES = ['a2a8c703', 'ed81cdda', 'eadb80b8']
ERC165_FUNCTION_SIGNATURES = ['01ffc9a7']
ERC20_FUNCTION_SIGNATURES = ['a9059cbb', '23b872dd', '095ea7b3']
ERC777_FUNCTION_SIGNATURES = ['dd62ed3e', 'a457c2d7', 'eac0d0f6']
ERC4626_FUNCTION_SIGNATURES = ['e9fad8ee', '2e1a7d4d', 'a2b90d68', 'd0e30db0']
ERC223_FUNCTION_SIGNATURES = ['a9059cbb', 'c0ee0b8a']
ERC827_FUNCTION_SIGNATURES = ['f2fde38b', 'd7cdc6d5', 'e7af8c77']

# New function signatures
ERC1400_FUNCTION_SIGNATURES = ['e94a0102', 'c42cf535', 'f3e94b2a']
ERC3525_FUNCTION_SIGNATURES = ['f242a358', '1d26f864', 'a0712d68']
ERC2981_FUNCTION_SIGNATURES = ['2a55205a', '6ef1f7b3']
ERC1404_FUNCTION_SIGNATURES = ['75b238fc', 'cdab563a']
ERC1410_FUNCTION_SIGNATURES = ['e94a0102', 'c42cf535', '7b9a5e73']
ERC1594_FUNCTION_SIGNATURES = ['a1caff6a', '6f5f8833', '6ef91c5e']
ERC2309_FUNCTION_SIGNATURES = ['8462151c']

# Define a mapping of signatures to token type names
TOKEN_SIGNATURES = {
    "ERC-721": ERC721_FUNCTION_SIGNATURES,
    "ERC-1155": ERC1155_FUNCTION_SIGNATURES,
    "ERC-998": ERC998_FUNCTION_SIGNATURES,
    "ERC-165": ERC165_FUNCTION_SIGNATURES,
    "ERC-20": ERC20_FUNCTION_SIGNATURES,
    "ERC-777": ERC777_FUNCTION_SIGNATURES,
    "ERC-4626": ERC4626_FUNCTION_SIGNATURES,
    "ERC-223": ERC223_FUNCTION_SIGNATURES,
    "ERC-827": ERC827_FUNCTION_SIGNATURES,
    # Adding the new signatures
    "ERC-1400": ERC1400_FUNCTION_SIGNATURES,
    "ERC-3525": ERC3525_FUNCTION_SIGNATURES,
    "ERC-2981": ERC2981_FUNCTION_SIGNATURES,
    "ERC-1404": ERC1404_FUNCTION_SIGNATURES,
    "ERC-1410": ERC1410_FUNCTION_SIGNATURES,
    "ERC-1594": ERC1594_FUNCTION_SIGNATURES,
    "ERC-2309": ERC2309_FUNCTION_SIGNATURES
}

def classify_token_from_input(input_data):
    function_signature = input_data[2:10]  # Extract function signature
    for token_type, signatures in TOKEN_SIGNATURES.items():
        if function_signature in signatures:
            return token_type
    return "Unknown"

def classify_token_from_transfer(transfer_data):
    # Apply specific heuristics or known patterns if available
    # Placeholder logic for demonstration purposes
    value = transfer_data['value']
    if value > 1e16:
        return "ERC-20"
    elif value == 1:
        return "ERC-721"
    else:
        return "Unknown"

def count_token_transfers(transactions, token_transfers):
    token_counts = defaultdict(int)

    # Process transactions to classify by function signature
    for txn in transactions:
        if 'input' in txn:
            token_type = classify_token_from_input(txn['input'])
            token_counts[token_type] += 1

    # Process token transfers
    for transfer in token_transfers:
        token_type = classify_token_from_transfer(transfer)
        token_counts[token_type] += 1

    return token_counts

def main():
    # Load transaction data from JSON file
    with open('/home/mani//Downloads/txn.json', 'r') as txn_file:
        transactions = json.load(txn_file)

    # Load token transfer data from JSON file
    with open('/home/mani//Downloads/token.json', 'r') as transfer_file:
        token_transfers = json.load(transfer_file)

    # Count token transfers by type
    token_counts = count_token_transfers(transactions, token_transfers)

    # Print the counts for the day
    date_str = datetime.now().strftime('%Y-%m-%d')
    print(f"Token transfers for {date_str}:")
    for token_type, count in token_counts.items():
        print(f"{token_type}: {count}")

    # Optionally, you can save these counts to a file or a database for later plotting

if __name__ == '__main__':
    main()
