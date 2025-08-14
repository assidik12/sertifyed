import { Contract, JsonRpcProvider, Wallet, Log, Interface } from "ethers";

// ABI smart contract
import SertifyEdABI from "../helper/SertifyEd.abi.json";

if (!process.env.SEPOLIA_RPC_URL || !process.env.MINTER_PRIVATE_KEY || !process.env.CONTRACT_ADDRESS) {
  throw new Error("Variabel lingkungan PROVIDER_URL, MINTER_PRIVATE_KEY, dan CONTRACT_ADDRESS harus diatur.");
}

const provider: JsonRpcProvider = new JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const signer: Wallet = new Wallet(process.env.MINTER_PRIVATE_KEY, provider);

const sertifyEdContract: Contract = new Contract(process.env.CONTRACT_ADDRESS, SertifyEdABI, signer);

console.log(`Blockchain service terhubung ke contract di alamat: ${process.env.CONTRACT_ADDRESS}`);

/**
 * Memanggil fungsi issueCertificate di smart contract.
 * @param {string} recipientWallet - Alamat wallet mahasiswa.
 * @param {string} dataHash - Hash dari detail sertifikat.
 * @returns {Promise<{tokenId: number, transactionHash: string}>} - Berisi tokenId dan transactionHash.
 */
export const issueCertificateOnChain = async (recipientWallet: string, dataHash: string): Promise<{ tokenId: number; transactionHash: string }> => {
  try {
    console.log(`Menerbitkan sertifikat untuk ${recipientWallet} dengan hash ${dataHash}`);
    const tx = await sertifyEdContract.issueCertificate(recipientWallet, dataHash);

    console.log(`Transaksi dikirim... Hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log("Transaksi berhasil di-mining!");

    const contractInterface = new Interface(SertifyEdABI);
    const logs = (receipt?.logs || [])
      .map((log: Log) => {
        try {
          return contractInterface.parseLog(log);
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);

    const issueEvent = logs.find((log: any) => log?.name === "CertificateIssued");

    if (!issueEvent) {
      throw new Error("Event CertificateIssued tidak ditemukan di dalam transaksi.");
    }

    const tokenId = issueEvent.args.tokenId;

    return {
      tokenId: Number(tokenId),
      transactionHash: tx.hash,
    };
  } catch (error) {
    console.error("Error saat menerbitkan sertifikat di blockchain:", error);
    throw new Error("Gagal melakukan transaksi di blockchain.");
  }
};

/**
 * Mengambil detail sertifikat dari blockchain untuk verifikasi.
 * @param {number} tokenId - ID unik sertifikat.
 * @returns {Promise<{issuerAddress: string, dataHash: string, ownerWallet: string}>} - Data on-chain.
 */
export const getOnChainVerificationData = async (tokenId: number): Promise<{ issuerAddress: string; dataHash: string; ownerWallet: string }> => {
  try {
    const contractReader = sertifyEdContract.connect(provider) as Contract;
    const [details, ownerWallet] = await Promise.all([contractReader.getCertificateDetails(tokenId), contractReader.ownerOf(tokenId)]);

    return {
      issuerAddress: details.issuerAddress,
      dataHash: details.dataHash,
      ownerWallet: ownerWallet,
    };
  } catch (error) {
    console.error(`Error mengambil data on-chain untuk token ID ${tokenId}:`, error);
    throw new Error("Sertifikat tidak ditemukan di blockchain.");
  }
};

/**
 * Mengambil daftar tokenId yang dimiliki oleh sebuah alamat.
 * @param {string} ownerAddress - Alamat wallet pemilik.
 * @returns {Promise<number[]>} - Array berisi nomor tokenId.
 */
export const getTokenIdsByOwner = async (ownerAddress: string): Promise<bigint[]> => {
  try {
    const contractReader = sertifyEdContract.connect(provider) as Contract;
    const tokenIdsBigInt: bigint[] = await contractReader.getCertificatesByOwner(ownerAddress);
    return tokenIdsBigInt;
  } catch (error) {
    console.error(`Error mengambil token untuk owner ${ownerAddress}:`, error);
    throw new Error("Gagal mengambil daftar sertifikat dari blockchain.");
  }
};

module.exports = {
  issueCertificateOnChain,
  getOnChainVerificationData,
  getTokenIdsByOwner,
};
