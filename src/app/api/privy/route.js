// import {PrivyClient} from '@privy-io/server-auth';

// const privy = new PrivyClient('insert_your_privy_app_id', 'insert_your_privy_app_secret');
// const {id, address, chainType} = await privy.walletApi.create({chainType: 'ethereum'});

// const {data} = await privy.walletApi.ethereum.signMessage({
//     walletId: id,
//     message: 'Hello server wallets!',
//   });
  
//   const {signature, encoding} = data;

//   const {data} = await privy.walletApi.ethereum.sendTransaction({
//     walletId: id,
//     caip2: 'eip155:84532',
//     transaction: {
//       to: '0xyourRecipientAddress',
//       value: 100000,
//       chainId: 84532,
//     },
//   });
  
//   const {hash} = data;