import { Base64 } from 'js-base64'

interface Token {
  symbol: string
}

interface TxInfo {
  amountUSD?: number
  id?: string
  timestamp?: string
  token0?: Token
  token1?: Token
  amount0?: string
  amount1?: string
}

interface FollowItem {
  timestamp: number
  address: string
  info?: string
  name?: string
  image?: string
}

export async function getPopularList(id: number | undefined): Promise<string[]> {
  const response = await fetch(
    'https://preserver.mytokenpocket.vip/v1/wallet/hot_address?ns=ethereum&chain_id=' + (id || 1)
  )
  const data = await response.text()

  return JSON.parse(data).data
}

export const formatURL = function (url: string | undefined) {
  if (!url) {
    return ''
  }
  if (url.indexOf('ipfs://') === 0) {
    url = url.replace(/ipfs:\/\//, 'https://infura-ipfs.io/ipfs/')
  }
  return url
}

export async function getFollowList(address: string): Promise<any[]> {
  try {
    const response = await fetch('https://openapi.5degrees.io/follow?address=' + address)
    const { data } = await response.json()

    let list = data.followings || []

    list = list.sort((a: FollowItem, b: FollowItem) => {
      return (a.timestamp || 0) > (b.timestamp || 0)
    })

    const obj: any = {}

    const finalList: FollowItem[] = []

    list.forEach((item: FollowItem) => {
      if (!obj[item.address]) {
        if (item.info) {
          const baseStr = item.info.split(',')[1]
          const baseJson = JSON.parse(Base64.decode(baseStr))
          item.name = baseJson.name
          item.image = formatURL(baseJson.image)
        }

        finalList.push(item)
        obj[item.address] = true
      }
    })

    console.log('finanList', finalList)

    return finalList
  } catch (err) {
    return []
  }
}

export async function getUniswapTxList(address: string, chainId: number, timestamp: number): Promise<TxInfo[]> {
  const document = `
    query { 
      swaps(first:20, orderBy:timestamp, where:{origin: "${address}",  timestamp_gt: ${timestamp || 0}}) {
        id
        timestamp
        token0 {
            symbol
        }
        token1 {
            symbol
        }
        amount0
        amount1
        amountUSD
      }
    }
  `

  const payload = JSON.stringify({
    query: document,
  })

  let FetchApi: string

  switch (chainId) {
    case 1:
      FetchApi = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3'
      break
    case 137:
      FetchApi = 'https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon'
      break
    case 10:
      FetchApi = 'https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis'
      break
    case 42161:
      FetchApi = 'https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-minimal'
      break
    default:
      FetchApi = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3'
      break
  }

  const response = await fetch(FetchApi, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: payload,
  })

  const { data } = await response.json()

  data.swaps.sort((a: TxInfo, b: TxInfo) => Number(b.timestamp) - Number(a.timestamp))

  const txList: TxInfo[] = data.swaps

  return txList
}
