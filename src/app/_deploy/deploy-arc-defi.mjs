import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
  keccak256,
  toBytes,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

const rootDir = process.cwd();
const envPath = resolve(rootDir, ".env.local");

const abi = [
  {
    type: "function",
    name: "lend",
    stateMutability: "nonpayable",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "borrow",
    stateMutability: "nonpayable",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "addLiquidity",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenA", type: "address" },
      { name: "tokenB", type: "address" },
      { name: "amountA", type: "uint256" },
      { name: "amountB", type: "uint256" },
    ],
    outputs: [],
  },
];

const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    decimals: 6,
    name: "USDC",
    symbol: "USDC",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.arc.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "ArcScan",
      url: "https://testnet.arcscan.app",
    },
  },
  testnet: true,
});

function functionSelector(signature) {
  return keccak256(toBytes(signature)).slice(2, 10);
}

function pushHex(hexValue, bytes) {
  const hex = hexValue.replace(/^0x/, "").padStart(bytes * 2, "0");
  return `${(0x5f + bytes).toString(16).padStart(2, "0")}${hex}`;
}

function pushNumber(value, bytes = value <= 0xff ? 1 : 2) {
  return pushHex(value.toString(16), bytes);
}

function buildRuntimeBytecode() {
  const chunks = [];

  const op = (hex) => chunks.push({ type: "bytes", hex });
  const push = (value, bytes) => chunks.push({ type: "bytes", hex: pushNumber(value, bytes) });
  const push4 = (hex) => chunks.push({ type: "bytes", hex: pushHex(hex, 4) });
  const label = (name) => chunks.push({ type: "label", name });
  const pushLabel = (name) => chunks.push({ type: "pushLabel", name });

  const transferFromSelector = functionSelector("transferFrom(address,address,uint256)");
  const transferSelector = functionSelector("transfer(address,uint256)");
  const lendSelector = functionSelector("lend(address,uint256)");
  const borrowSelector = functionSelector("borrow(address,uint256)");
  const addLiquiditySelector = functionSelector("addLiquidity(address,address,uint256,uint256)");

  function revertOnFailedCall() {
    op("15");
    pushLabel("revert");
    op("57");
  }

  function transferFrom(tokenOffset, amountOffset) {
    push4(transferFromSelector);
    push(0xe0);
    op("1b");
    push(0);
    op("52");
    op("33");
    push(0x04);
    op("52");
    op("30");
    push(0x24);
    op("52");
    push(amountOffset);
    op("35");
    push(0x44);
    op("52");
    push(0);
    push(0);
    push(0x64);
    push(0);
    push(0);
    push(tokenOffset);
    op("35");
    op("5a");
    op("f1");
    revertOnFailedCall();
  }

  function transfer(tokenOffset, amountOffset) {
    push4(transferSelector);
    push(0xe0);
    op("1b");
    push(0);
    op("52");
    op("33");
    push(0x04);
    op("52");
    push(amountOffset);
    op("35");
    push(0x24);
    op("52");
    push(0);
    push(0);
    push(0x44);
    push(0);
    push(0);
    push(tokenOffset);
    op("35");
    op("5a");
    op("f1");
    revertOnFailedCall();
  }

  push(0);
  op("35");
  push(0xe0);
  op("1c");
  op("80");
  push4(lendSelector);
  op("14");
  pushLabel("lend");
  op("57");
  op("80");
  push4(borrowSelector);
  op("14");
  pushLabel("borrow");
  op("57");
  op("80");
  push4(addLiquiditySelector);
  op("14");
  pushLabel("addLiquidity");
  op("57");

  label("revert");
  push(0);
  push(0);
  op("fd");

  label("lend");
  op("5b");
  transferFrom(0x04, 0x24);
  op("00");

  label("borrow");
  op("5b");
  transfer(0x04, 0x24);
  op("00");

  label("addLiquidity");
  op("5b");
  transferFrom(0x04, 0x44);
  transferFrom(0x24, 0x64);
  op("00");

  let offset = 0;
  const labels = new Map();
  for (const chunk of chunks) {
    if (chunk.type === "label") {
      labels.set(chunk.name, offset);
    } else if (chunk.type === "pushLabel") {
      offset += 3;
    } else {
      offset += chunk.hex.length / 2;
    }
  }

  return `0x${chunks
    .map((chunk) => {
      if (chunk.type === "label") {
        return "";
      }

      if (chunk.type === "pushLabel") {
        const labelOffset = labels.get(chunk.name);
        if (labelOffset === undefined) {
          throw new Error(`Missing bytecode label: ${chunk.name}`);
        }
        return pushNumber(labelOffset, 2);
      }

      return chunk.hex;
    })
    .join("")}`;
}

function buildCreationBytecode(runtimeBytecode) {
  const runtime = runtimeBytecode.slice(2);
  const runtimeLength = runtime.length / 2;
  const initHeaderLength = 15;
  const init = [
    pushNumber(runtimeLength, 2),
    pushNumber(initHeaderLength, 2),
    pushNumber(0),
    "39",
    pushNumber(runtimeLength, 2),
    pushNumber(0),
    "f3",
  ].join("");

  return `0x${init}${runtime}`;
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  return readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
        return env;
      }

      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim();
      env[key] = value;
      return env;
    }, {});
}

async function main() {
  const env = { ...process.env, ...loadEnvFile(envPath) };
  const privateKey = env.DEPLOYER_PRIVATE_KEY;
  const rpcUrl = env.NEXT_PUBLIC_ARC_RPC_URL || "https://rpc.testnet.arc.network";

  if (env.NEXT_PUBLIC_DEPLOYER_PRIVATE_KEY) {
    throw new Error("Do not use NEXT_PUBLIC_DEPLOYER_PRIVATE_KEY. Move the key to DEPLOYER_PRIVATE_KEY in .env.local.");
  }

  if (!privateKey || !/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
    throw new Error("Add DEPLOYER_PRIVATE_KEY=0x... to .env.local before deploying.");
  }

  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(rpcUrl),
  });
  const walletClient = createWalletClient({
    account,
    chain: arcTestnet,
    transport: http(rpcUrl),
  });
  const bytecode = buildCreationBytecode(buildRuntimeBytecode());

  console.log(`Deploying ArcDeFiVault from ${account.address}`);
  const hash = await walletClient.deployContract({
    abi,
    account,
    bytecode,
  });
  console.log(`Deployment transaction: ${hash}`);

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  const contractAddress = receipt.contractAddress;

  if (!contractAddress) {
    throw new Error("Deployment receipt did not include a contract address.");
  }

  let nextEnv = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  for (const key of [
    "NEXT_PUBLIC_LEND_POOL_BORROW_CONTRACT_ADDRESS",
    "NEXT_PUBLIC_LEND_CONTRACT_ADDRESS",
    "NEXT_PUBLIC_POOL_CONTRACT_ADDRESS",
    "NEXT_PUBLIC_BORROW_CONTRACT_ADDRESS",
  ]) {
    nextEnv = setEnvValueFromContent(nextEnv, key, contractAddress);
  }
  writeFileSync(envPath, nextEnv);

  console.log(`ArcDeFiVault deployed: ${contractAddress}`);
  console.log(`Updated .env.local with ${contractAddress}`);
  console.log(`Explorer: https://testnet.arcscan.app/address/${contractAddress}`);
}

function setEnvValueFromContent(content, key, value) {
  const line = `${key}=${value}`;
  const matcher = new RegExp(`^${key}=.*$`, "m");

  if (matcher.test(content)) {
    return content.replace(matcher, line);
  }

  const separator = content.endsWith("\n") || content.length === 0 ? "" : "\n";
  return `${content}${separator}${line}\n`;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
