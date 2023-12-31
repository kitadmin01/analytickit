from django.db.models import Sum
from analytickit.models.crypto.wallet_address import VisitorWalletAddress
import json
from collections import defaultdict
from datetime import datetime
from decimal import Decimal
import structlog

logger = structlog.get_logger(__name__)

class WalletAddressMetricCal:
      def __init__(self, team_id):
            self.team_id = team_id



      def calculate_transaction_volume_and_value(self):
            wallet_addresses = VisitorWalletAddress.objects.filter(team_id=self.team_id)
            results = {}

            for wallet_address in wallet_addresses:
                  transactions = wallet_address.txn_data
                  total_volume = len(transactions)
                  
                  total_value = Decimal('0')
                  for txn in transactions:
                        try:
                              if 'value' in txn:
                                    total_value += Decimal(str(txn['value']))
                        except Exception as e:
                              logger.error(f"Unexpected error in calculate_transaction_volume_and_value: {e}")

                  results[wallet_address.visitor_wallet_address] = {
                        'total_volume': total_volume,
                        # Convert Decimal to a string for serialization
                        'total_value': str(total_value)
                  }

            return json.dumps(results)


      def calculate_token_holdings_and_transfers(self):
            # Query the VisitorWalletAddress model for the specified team_id
            wallet_addresses = VisitorWalletAddress.objects.filter(team_id=self.team_id)

            # Initialize a dictionary to store the results
            results = {}

            # Iterate over each wallet address
            for wallet_address in wallet_addresses:
                  # Assuming token_transfer_data contains fields 'token_address', 'from_address', 'to_address', and 'value'
                  token_transfers = wallet_address.token_transfer_data

                  # Initialize a dictionary to store token transfer details for this wallet
                  token_details = {}

                  # Process each token transfer
                  for transfer in token_transfers:
                        token_address = transfer['token_address']
                        value = transfer['value']

                        # Check if the wallet address is the sender or receiver
                        if wallet_address.visitor_wallet_address == transfer['from_address']:
                              # Outgoing transfer - subtract value
                              token_details.setdefault(token_address, 0)
                              token_details[token_address] -= value
                        elif wallet_address.visitor_wallet_address == transfer['to_address']:
                              # Incoming transfer - add value
                              token_details.setdefault(token_address, 0)
                              token_details[token_address] += value

                  # Store the token transfer details in the results
                  results[wallet_address.visitor_wallet_address] = token_details

            # Return the results as JSON
            return json.dumps(results)
      
      def calculate_gas_usage_and_costs(self):
            # Query the VisitorWalletAddress model for the specified team_id
            wallet_addresses = VisitorWalletAddress.objects.filter(team_id=self.team_id)

            # Initialize a dictionary to store the results
            results = {}

            # Iterate over each wallet address
            for wallet_address in wallet_addresses:
                  # Assuming txn_data contains fields 'gas', 'gas_price', and 'receipt_gas_used'
                  transactions = wallet_address.txn_data

                  # Initialize total gas used and total cost
                  total_gas_used = 0
                  total_cost = 0

                  # Process each transaction
                  for txn in transactions:
                        gas_used = txn.get('receipt_gas_used', 0)
                        gas_price = txn.get('gas_price', 0)

                        # Calculate gas used and cost for this transaction
                        total_gas_used += gas_used
                        total_cost += gas_used * gas_price

                        # Store the gas usage and cost details in the results
                        results[wallet_address.visitor_wallet_address] = {
                        'total_gas_used': total_gas_used,
                        'total_cost': total_cost
                        }

            # Return the results as JSON
            return json.dumps(results)
      
      
      def calculate_active_periods(self):
            # Query the VisitorWalletAddress model for the specified team_id
            wallet_addresses = VisitorWalletAddress.objects.filter(team_id=self.team_id)

            # Initialize a dictionary to store the results
            results = {}

            # Iterate over each wallet address
            for wallet_address in wallet_addresses:
                  # Assuming txn_data contains a field 'date' representing the transaction date
                  transactions = wallet_address.txn_data

                  # Initialize a dictionary to count occurrences per day
                  active_days = defaultdict(int)

                  # Process each transaction
                  for txn in transactions:
                        date_str = txn.get('date')
                        if date_str:
                              # Convert date string to a datetime object
                              date_time = datetime.strptime(date_str, '%Y-%m-%d')
                              day = date_time.strftime('%Y-%m-%d')
                              active_days[day] += 1

                  # Store the active periods in the results
                  results[wallet_address.visitor_wallet_address] = dict(active_days)

            # Return the results as JSON
            return json.dumps(results)

      def calculate_smart_contract_interactions(self):
            # Query the VisitorWalletAddress model for the specified team_id
            wallet_addresses = VisitorWalletAddress.objects.filter(team_id=self.team_id)

            # Initialize a dictionary to store the results
            results = {}

            # Iterate over each wallet address
            for wallet_address in wallet_addresses:
                  # Assuming txn_data contains fields 'to_address' and 'input'
                  transactions = wallet_address.txn_data

                  # Initialize a set to store unique smart contract addresses interacted with
                  interacted_contracts = set()

                  # Process each transaction
                  for txn in transactions:
                        to_address = txn.get('to_address')
                        input_data = txn.get('input')

                        # Check if the transaction involves a smart contract interaction
                        if to_address and input_data and input_data != '0x':
                              interacted_contracts.add(to_address)

                  # Store the smart contract interaction details in the results
                  results[wallet_address.visitor_wallet_address] = list(interacted_contracts)

            # Return the results as JSON
            return json.dumps(results)
      
      def calculate_nft_transactions(self):
            """
            token_id is available in logs, we need to get it from logs and look into topics. So this method is not used for MVP release
            https://ethereum.stackexchange.com/questions/92712/how-do-i-obtain-the-tokenid-of-an-erc721-token-through-etherscan-api-transaction
            """
            # Query the VisitorWalletAddress model for the specified team_id
            wallet_addresses = VisitorWalletAddress.objects.filter(team_id=self.team_id)

            # Initialize a dictionary to store the results
            results = {}

            # Iterate over each wallet address
            for wallet_address in wallet_addresses:
                  # Assuming token_transfer_data contains fields 'token_address', 'from_address', 'to_address', and 'token_id' for NFTs
                  token_transfers = wallet_address.token_transfer_data

                  # Initialize a list to store NFT transaction details
                  nft_transactions = []

                  # Process each token transfer
                  for transfer in token_transfers:
                        # Check if the transfer is an NFT transaction (e.g., based on token_id presence)
                        if 'token_id' in transfer:
                              nft_transactions.append(transfer)

                  # Store the NFT transaction details in the results
                  results[wallet_address.visitor_wallet_address] = nft_transactions

            # Return the results as JSON
            return json.dumps(results)
      

      def calculate_network_analysis(self):
            # Query the VisitorWalletAddress model for the specified team_id
            wallet_addresses = VisitorWalletAddress.objects.filter(team_id=self.team_id)

            # Initialize a dictionary to store the network connections
            network_connections = defaultdict(lambda: defaultdict(int))

            # Iterate over each wallet address
            for wallet_address in wallet_addresses:
                  # Combine txn_data and token_transfer_data for comprehensive analysis
                  combined_data = wallet_address.txn_data + wallet_address.token_transfer_data

                  # Process each transaction or token transfer
                  for data in combined_data:
                        from_address = data.get('from_address')
                        to_address = data.get('to_address')

                        # Increment the connection count between from_address and to_address
                        if from_address and to_address:
                              network_connections[from_address][to_address] += 1
                              network_connections[to_address][from_address] += 1

            # Convert the defaultdict to a regular dict for JSON serialization
            network_connections = {k: dict(v) for k, v in network_connections.items()}

            # Return the results as JSON
            return json.dumps(network_connections)
      

      def calculate_historical_trends(self):
            # Query the VisitorWalletAddress model for the specified team_id
            wallet_addresses = VisitorWalletAddress.objects.filter(team_id=self.team_id)

            # Initialize a dictionary to store the results
            trends = defaultdict(lambda: defaultdict(lambda: {'volume': 0, 'value': 0.0}))

            # Iterate over each wallet address
            for wallet_address in wallet_addresses:
                  # Combine txn_data and token_transfer_data for comprehensive analysis
                  combined_data = wallet_address.txn_data + wallet_address.token_transfer_data

                  # Process each transaction or token transfer
                  for data in combined_data:
                        date_str = data.get('date')
                        value_str = data.get('value', '0')

                        if date_str:
                              # Use date directly
                              date = date_str

                              # Convert value to float and update for this date
                              try:
                                    value = float(value_str)
                              except ValueError:
                                    # Handle the case where value_str is not a valid number
                                    value = 0.0

                              trends[wallet_address.visitor_wallet_address][date]['volume'] += 1
                              trends[wallet_address.visitor_wallet_address][date]['value'] += value

            # Convert the defaultdict to a regular dict for JSON serialization
            trends = {k: dict(v) for k, v in trends.items()}

            # Return the results as JSON
            return json.dumps(trends)



      def calculate_cross_contract_analysis(self):
            # Query the VisitorWalletAddress model for the specified team_id
            wallet_addresses = VisitorWalletAddress.objects.filter(team_id=self.team_id)

            # Initialize a dictionary to store the results
            cross_contract_interactions = defaultdict(lambda: defaultdict(int))

            # Iterate over each wallet address
            for wallet_address in wallet_addresses:
                  # Process each transaction
                  for txn in wallet_address.txn_data:
                        to_address = txn.get('to_address')

                        # Check if the transaction is to a smart contract
                        if to_address and txn.get('input', '') != '0x':
                              cross_contract_interactions[wallet_address.visitor_wallet_address][to_address] += 1

            # Convert the defaultdict to a regular dict for JSON serialization
            cross_contract_interactions = {k: dict(v) for k, v in cross_contract_interactions.items()}

            # Return the results as JSON
            return json.dumps(cross_contract_interactions)
   
      
      def track_whales(self, threshold_value):
            # Query the VisitorWalletAddress model for the specified team_id
            wallet_addresses = VisitorWalletAddress.objects.filter(team_id=self.team_id)

            # Initialize a dictionary to store the results
            whales = defaultdict(lambda: {'transaction_volume': 0, 'total_value': 0.0})

            # Iterate over each wallet address
            for wallet_address in wallet_addresses:
                  # Process each transaction
                  for txn in wallet_address.txn_data:
                        value_str = txn.get('value', '0')

                        # Convert value to float
                        try:
                              value = float(value_str)
                        except ValueError:
                              # Handle the case where value_str is not a valid number
                              value = 0.0

                        # Update transaction volume and total value
                        whales[wallet_address.visitor_wallet_address]['transaction_volume'] += 1
                        whales[wallet_address.visitor_wallet_address]['total_value'] += value

            # Filter out the whales based on the threshold value
            whales = {address: data for address, data in whales.items() if data['total_value'] >= threshold_value}

            # Return the results as JSON
            return json.dumps(whales)
      
      def calculate_geographical_insights(self):
        '''
        Not used for MVP release
        '''
        # Query the VisitorWalletAddress model for the specified team_id
        wallet_addresses = VisitorWalletAddress.objects.filter(team_id=self.team_id)

        # Initialize a dictionary to store geographical insights
        geo_insights = defaultdict(int)

        # Iterate over each wallet address
        for wallet_address in wallet_addresses:
            # Retrieve the geographical location for the wallet address
            geo_location = self.geographical_data.get(wallet_address.visitor_wallet_address)

            # Increment the count for this geographical location
            if geo_location:
                geo_insights[geo_location] += 1

        # Return the results as JSON
        return json.dumps(geo_insights)
      
      def calculate_token_diversity(self):
            # Query the VisitorWalletAddress model for the specified team_id
            wallet_addresses = VisitorWalletAddress.objects.filter(team_id=self.team_id)

            # Initialize a dictionary to store the results
            token_diversity = {}

            # Iterate over each wallet address
            for wallet_address in wallet_addresses:
                  # Initialize a set to store unique token addresses
                  unique_tokens = set()

                  # Process each token transfer
                  for transfer in wallet_address.token_transfer_data:
                        token_address = transfer.get('token_address')
                        if token_address:
                              unique_tokens.add(token_address)

                  # Store the count of unique tokens in the results
                  token_diversity[wallet_address.visitor_wallet_address] = len(unique_tokens)

            # Return the results as JSON
            return json.dumps(token_diversity)