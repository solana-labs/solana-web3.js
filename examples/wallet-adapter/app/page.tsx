'use client';

import {
  WalletConnectButton,
  WalletDisconnectButton,
  WalletModalButton,
  WalletMultiButton,
} from '@solana/wallet-adapter';
import {SendLegacyTransaction} from '../components/SendLegacyTransaction';
import {SendTransaction} from '../components/SendTransaction';
import {SendV0Transaction} from '../components/SendV0Transaction';
import {SendV1Transaction} from '../components/SendV1Transaction';
import {Settings} from '../components/Settings';
import {SignIn} from '../components/SignIn';
import {SignMessage} from '../components/SignMessage';
import {SignOffchainMessage} from '../components/SignOffchainMessage';
import {SignTransaction} from '../components/SignTransaction';

export default function Page() {
  return (
    <main>
      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>React UI</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Connect Button</td>
            <td>
              <WalletConnectButton />
            </td>
          </tr>
          <tr>
            <td>Disconnect Button</td>
            <td>
              <WalletDisconnectButton />
            </td>
          </tr>
          <tr>
            <td>Dialog/Modal Button</td>
            <td>
              <WalletModalButton />
            </td>
          </tr>
          <tr>
            <td>Multi Button</td>
            <td>
              <WalletMultiButton />
            </td>
          </tr>
        </tbody>
      </table>
      <table>
        <thead>
          <tr>
            <th>Example</th>
            <th colSpan={2}>
              <Settings />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <SignMessage />
            </td>
            <td>
              <SignOffchainMessage />
            </td>
            <td>
              <SignIn />
            </td>
          </tr>
          <tr>
            <td>
              <SignTransaction />
            </td>
            <td>
              <SendTransaction />
            </td>
            <td></td>
          </tr>
          <tr>
            <td>
              <SendLegacyTransaction />
            </td>
            <td>
              <SendV0Transaction />
            </td>
            <td>
              <SendV1Transaction />
            </td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
