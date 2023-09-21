"""
Created on Aug 31 2023

__author__ = "Mani Malarvannan"
__copyright__ ="AnalyticKit, Inc. 2023"
"""


import json
from logger_config import logger
import datetime
from collections import defaultdict



class MetricCalculator:
    """
    This class is used to calculate the metrics for the given data.
    """

    def __init__(self, data: dict, contract_address: str, token_address: str):
        self.data = data
        self.contract_address = contract_address
        self.token_address = token_address

    def calculate_dau(self):
        # Calculate daily active users for the data provided. 
        # The data dict contains all the Ethereum related data retrieved from the s3 bucket.

        # Extract the 'transactions' and 'token_transfers' data
        transactions_data = self.data.get('transactions', [])
        token_transfers_data = self.data.get('token_transfers', [])

        active_addresses = {record.get('to_address') for record in transactions_data}
        active_addresses.update({record.get('to_address') for record in token_transfers_data})

        # Remove None values if any
        active_addresses.discard(None)

        return len(active_addresses)


    def calculate_contract_calls(self):
        # Extract the 'transactions' data
        transactions_data = self.data.get('transactions', [])

        # Filter the transactions where the 'to_address' matches the provided contract_address
        contract_calls = [txn for txn in transactions_data if txn.get(
            'to_address') == self.contract_address]

        return len(contract_calls)

    def calculate_average_gas_used(self):
        # Extract the 'transactions' data
        transactions_data = self.data.get('transactions', [])

        # If there are no transactions, return 0 to avoid division by zero
        if not transactions_data:
            return 0

        # Sum up all the 'receipt_gas_used' values
        total_gas_used = sum(int(txn.get('receipt_gas_used', 0))
                             for txn in transactions_data)

        return total_gas_used / len(transactions_data)

    def calculate_function_calls_count(self):
        # Extract the 'transactions' data
        transactions_data = self.data.get('transactions', [])

        # Filter transactions where the 'input' field is not "0x"
        function_calls = [txn for txn in transactions_data if txn.get(
            'input') and txn.get('input') != "0x"]

        return len(function_calls)

    def calculate_total_tokens_transferred(self):
        # Extract the 'token Transfers' data
        token_transfers_data = self.data.get('token Transfers', [])

        return sum(transfer.get('value', 0) for transfer in token_transfers_data)

    def calculate_total_transactions(self):
        # Extract the 'TXN' data (transactions data)
        transactions_data = self.data.get('transactions', [])

        return len(transactions_data)

    def calculate_average_transaction_fee(self):
        # Extract the 'TXN' data (transactions data)
        transactions_data = self.data.get('transactions', [])

        # Calculate the total transaction fee for all transactions
        total_fee = sum(int(float(txn.get('gas_price', 0))) *
                        int(float(txn.get('receipt_gas_used', 0))) for txn in transactions_data)

        return total_fee / len(transactions_data) if transactions_data else 0

    def calculate_total_transactions_from_address(self):
        address_count = (
            self._extracted_from_calculate_total_transactions_address(
                'from_address'
            )
        )
        return json.dumps(address_count)

    def calculate_total_transactions_to_address(self):
        address_count = (
            self._extracted_from_calculate_total_transactions_address(
                'to_address'
            )
        )
        return json.dumps(address_count)

    def _extracted_from_calculate_total_transactions_address(self, address):
        transactions_data = self.data.get('transactions', [])
        result = {}
        for txn in transactions_data:
            if address_data := txn.get(address):
                result[address_data] = result.get(address_data, 0) + 1
        return result

    def calculate_transaction_value_distribution(self):
        # Extract the 'TXN' data (transactions data)
        transactions_data = self.data.get('transactions', [])

        # Define value bins/ranges.
        # We can capture the low, mid, and high txn value. Large values are in the catch-all bin (5000e18, 1e21)
        bins = [
            (0, 0.01e18),               # 0 - 0.01 ETH
            (0.01e18, 0.1e18),          # 0.01 - 0.1 ETH
            (0.1e18, 1e18),             # 0.1 - 1 ETH
            (1e18, 10e18),              # 1 - 10 ETH
            (10e18, 50e18),             # 10 - 50 ETH
            (50e18, 100e18),            # 50 - 100 ETH
            (100e18, 500e18),           # 100 - 500 ETH
            (500e18, 1000e18),          # 500 - 1000 ETH
            (1000e18, 5000e18),         # 1000 - 5000 ETH
            # ... add more as necessary
            (5000e18, 1e22),            # ... and a large catch-all bin for outliers
        ]

        # Create a dictionary to store the count of transactions for each bin/range
        value_distribution = {}

        # Initialize the dictionary with bins
        # 1 Ether is equal to 10^8 Wei. When dealing with raw transaction values or gas prices in Ethereum,
        # they are often represented in Wei. Therefore, when presenting this data to users or for analysis,
        # it's common to convert from Wei to Ether for better readability.
        for bin_range in bins:
            key = f"{bin_range[0]/1e18}-{bin_range[1]/1e18} ETH"
            value_distribution[key] = 0

        # Iterate through the transactions and update the count for each value bin/range
        for txn in transactions_data:
            value = txn.get('value', 0)
            for bin_range in bins:
                if bin_range[0] <= value < bin_range[1]:
                    key = f"{bin_range[0]/1e18}-{bin_range[1]/1e18} ETH"
                    value_distribution[key] += 1
                    break

        return json.dumps(value_distribution)

    def calculate_token_transfer_volume(self):
        # Extract the 'token_transfers' data
        token_transfers_data = self.data.get('token_transfers', [])

        return sum(int(float(transfer.get('value', 0))) for transfer in token_transfers_data)

    def most_active_token_addresses(self):
        # Extract the 'token_transfers' data
        token_transfers_data = self.data.get('token_transfers', [])

        # Dictionary to hold the counts for each address
        address_counts = {}

        # Loop through each token transfer and count the activity
        for transfer in token_transfers_data:
            from_address = transfer.get('from_address')
            to_address = transfer.get('to_address')

            # Increment count for from_address
            if from_address:
                address_counts[from_address] = address_counts.get(
                    from_address, 0) + 1

            # Increment count for to_address
            if to_address:
                address_counts[to_address] = address_counts.get(
                    to_address, 0) + 1

        # Sort addresses by their counts in descending order
        sorted_addresses = sorted(
            address_counts.items(), key=lambda x: x[1], reverse=True)

        return dict(sorted_addresses)

    def calculate_average_token_transfer_value(self):
        # Extract the 'token_transfers' data
        token_transfers_data = self.data.get('token_transfers', [])

        # Sum up all the token transfer values
        total_value = sum(int(transfer.get('value', 0))
                          for transfer in token_transfers_data)

        # Calculate the average value
        ave_token_transfer_value = total_value / \
            len(token_transfers_data) if token_transfers_data else 0

        return ave_token_transfer_value / 1e18
    
    def calculate_token_transfer_value(self):
        # Extract the 'token_transfers' data
        token_transfers_data = self.data.get('token_transfers', [])

        # Convert the values to float first to handle scientific notation, then convert to int if needed
        return sum(int(float(transfer.get('value', 0))) for transfer in token_transfers_data)



    def calculate_token_flow(self):
        """
        The "token_flow" is mapping of the transfers of a specific token between sender and receiver addresses. 
        This can be represented as a directed graph where each edge signifies a token transfer and its weight is 
        the amount transferred. However, for simplicity, we can represent it as a JSON object where each key is a 
        tuple (from_address, to_address) and its value is the total amount transferred between these two addresses.
        """
        # Extract the 'token_transfers' data
        token_transfers_data = self.data.get('token_transfers', [])

        # Dictionary to store the flow of tokens between addresses
        flow_dict = {}

        for transfer in token_transfers_data:
            from_address = transfer.get('from_address')
            to_address = transfer.get('to_address')
            value = int(transfer.get('value', 0))

            # Use tuple (from_address, to_address) as the key, and add up the values
            flow_key = (from_address, to_address)
            if flow_key in flow_dict:
                flow_dict[flow_key] += value
            else:
                flow_dict[flow_key] = value

        return [
            {"from": key[0], "to": key[1], "value": str(value)}
            for key, value in flow_dict.items()
        ]

    def calculate_token_transfer_value_distribution(self):
        # Extract the 'token_transfers' data
        token_transfers_data = self.data.get('token_transfers', [])

        # Define the bins for token transfer value distribution
        bins = [
            (0, 1e15),            # 0 to 0.001 ETH
            (1e15, 1e16),        # 0.001 to 0.01 ETH
            (1e16, 1e17),        # 0.01 to 0.1 ETH
            (1e17, 1e18),        # 0.1 to 1 ETH
            (1e18, 10 * 1e18),   # 1 to 10 ETH
            (10 * 1e18, 100 * 1e18),  # 10 to 100 ETH
            (100 * 1e18, 500 * 1e18),  # 100 to 500 ETH
            (500 * 1e18, 1e21)      # 500 ETH to 1000 ETH
        ]

        # Dictionary to store the count of transfers in each bin
        distribution_dict = {
            f"{bin_range[0]/1e18}-{bin_range[1]/1e18} ETH": 0 for bin_range in bins}

        # Check each token transfer and update the appropriate bin in the distribution
        for transfer in token_transfers_data:
            value = int(transfer.get('value', 0))

            for bin_range in bins:
                if bin_range[0] <= value < bin_range[1]:
                    distribution_dict[f"{bin_range[0]/1e18}-{bin_range[1]/1e18} ETH"] += 1
                    break

        return distribution_dict

    def frequency_of_transactions(self):
        # Dictionary to hold the frequency of transactions by day
        freq_by_day = defaultdict(int)

        txn_data = self.data.get('transactions', [])

        # Extracting the block_timestamp from the transactions
        for txn in txn_data:
            if timestamp := txn.get("block_timestamp", None):
                # Convert the timestamp to a human-readable date
                # Assuming timestamp is in milliseconds
                date = datetime.datetime.fromtimestamp(timestamp / 1000).date()
                freq_by_day[str(date)] += 1

        return dict(freq_by_day)
