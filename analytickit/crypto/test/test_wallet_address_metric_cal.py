import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'analytickit.settings')
django.setup()
sys.path.append('./analytickit/crypto')  

from wallet_address_metric import WalletAddressMetricCal 

class TestWalletAddressMetricCal:

      wall_met_cal = WalletAddressMetricCal(8)
      tx_vol = wall_met_cal.calculate_transaction_volume_and_value()
      tok_hold = wall_met_cal.calculate_token_holdings_and_transfers()
      gas_usage = wall_met_cal.calculate_gas_usage_and_costs()
      act_period = wall_met_cal.calculate_active_periods()
      smart_contract_int = wall_met_cal.calculate_smart_contract_interactions()
      network_anal = wall_met_cal.calculate_network_analysis()
      hist_trends = wall_met_cal.calculate_historical_trends()
      cross_con_anal = wall_met_cal.calculate_cross_contract_analysis()
      track_whal = wall_met_cal.track_whales(1000)
      tok_div = wall_met_cal.calculate_token_diversity()

      print("tx_vol=",tx_vol)
      print("tok_hold=",tok_hold)
      print("gas_usage=",gas_usage)
      print("act_period=",act_period)
      print("smart_contract_int=",smart_contract_int)
      print("network_anal=",network_anal)
      print("hist_trends=",hist_trends)
      print("cross_con_anal=",cross_con_anal)
      print("track_whal=",track_whal)
      print("tok_div=",tok_div)
