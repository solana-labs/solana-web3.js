use {
    borsh::{BorshDeserialize, BorshSerialize},
    solana_program::{
        account_info::AccountInfo,
        entrypoint::ProgramResult,
        program::set_return_data,
        pubkey::Pubkey,
    },
};

solana_program::entrypoint!(process_instruction);

#[derive(BorshDeserialize, BorshSerialize)]
struct Asset {
    asset_type: String,
    asset_size: u32,
}

fn process_instruction(_program_id: &Pubkey, _accounts: &[AccountInfo], _data: &[u8]) -> ProgramResult {
    let asset = Asset {
        asset_type: "PNG".to_string(),
        asset_size: 100,
    };
    let data = asset.try_to_vec()?;
    set_return_data(&data);
    Ok(())
}
