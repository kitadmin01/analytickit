

// Modify the CommunityEngagement interface
export interface CommunityEngagement {
    id?: any;
    team_id?: number;   
    campaign_name?: string;
    token_address?: string;
    contract_type?: 'ERC-20' | 'ERC-721' | 'ERC-777';
    start_date?: Date;
    end_date?: Date;
    date?: Date;
    contract_address?: string;
    active_users?: number;
    total_contract_calls?: number;
    average_gas_used?: number;
    function_calls_count?: Record<string, number>;
    tot_tokens_transferred?: number;
    referral_count?: number;
    last_modified?: Date;
    tot_txns?: number;
    ave_gas_used?: number;
    transaction_value_distribution?: Record<string, number>;
    ave_txn_fee?: number;
    tot_txn_from_address?: Record<string, number>;
    tot_txn_to_address?: Record<string, number>;
    freq_txn?: Record<string, number>;
    token_transfer_volume?: number;
    token_transfer_value?: number;
    most_active_token_addresses?: Record<string, number>;
    ave_token_transfer_value?: number;
    token_flow?: Record<string, number>;
    token_transfer_value_distribution?: Record<string, number>;
}

// Modify the CommunityEngagementCreatePayload type
export type CommunityEngagementCreatePayload = Omit<CommunityEngagement, 'team' | 'last_modified'> & {
    team_id: number;  // Use team_id when creating a CommunityEngagement
};
