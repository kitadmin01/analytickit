import json
from collections import defaultdict
from datetime import datetime

# Function signatures for various token standards
ERC721_FUNCTION_SIGNATURES = [
    '80ac58cd', '5b5e139f', '95d89b41', '6352211e'
]

ERC1155_FUNCTION_SIGNATURES = [
    'd9b67a26', '0e89341c', '4e2312e0'
]

ERC998_FUNCTION_SIGNATURES = [
    'a2a8c703', 'ed81cdda', 'eadb80b8'
]

ERC165_FUNCTION_SIGNATURES = [
    '01ffc9a7'
]

ERC20_FUNCTION_SIGNATURES = [
    'a9059cbb', '23b872dd', '095ea7b3'
]

ERC777_FUNCTION_SIGNATURES = [
    'dd62ed3e', 'a457c2d7', 'eac0d0f6'
]

ERC4626_FUNCTION_SIGNATURES = [
    'e9fad8ee', '2e1a7d4d', 'a2b90d68', 'd0e30db0'
]

ERC223_FUNCTION_SIGNATURES = [
    'a9059cbb', 'c0ee0b8a'
]

ERC827_FUNCTION_SIGNATURES = [
    'f2fde38b', 'd7cdc6d5', 'e7af8c77'
]

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
    "ERC-827": ERC827_FUNCTION_SIGNATURES
}

def classify_token_from_input(input_data):
    function_signature = input_data[2:10]  # Extract function signature
    for token_type, signatures in TOKEN_SIGNATURES.items():
        if function_signature in signatures:
            return token_type
    return "Unknown"

def count_token_transfers(transactions, token_transfers):
    token_counts = defaultdict(int)

    # Process transactions
    for txn in transactions:
        if 'input' in txn:
            token_type = classify_token_from_input(txn['input'])
            token_counts[token_type] += 1

    # Process token transfers
    for transfer in token_transfers:
        # Heuristically classify based on `value` and patterns
        value = transfer['value']
        if value > 1e16:
            token_counts["ERC-20"] += 1
        elif value == 1:
            token_counts["ERC-721"] += 1
        else:
            token_counts["Unknown"] += 1

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
