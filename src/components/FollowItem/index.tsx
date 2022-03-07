import { Trans } from '@lingui/macro'
import jazzicon from '@metamask/jazzicon'
import HistoryItem from 'components/HistoryItem'
import { RowBetween } from 'components/Row'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components/macro'
import { MEDIA_WIDTHS } from 'theme'

import { useActiveWeb3React } from '../../hooks/web3'
import { getUniswapTxList } from '../../utils/getFollowList'

const SimpleWrap = styled.div`
  display: block;
  width: 100%;
  box-sizing: border-box;
  text-align: left;
  padding: 8px;
`

const EmptyWrap = styled.div`
  display: block;
  padding: 12px;
`

const LinkRow = styled.div`
  align-items: center;
  border-radius: 20px;
  display: flex;
  user-select: none;
  display: flex;
  flex-direction: column;

  justify-content: space-between;
  color: ${({ theme }) => theme.text1};
  margin: 8px 0;
  padding: 16px;
  text-decoration: none;
  font-weight: 500;
  background-color: ${({ theme }) => theme.bg1};

  &:last-of-type {
    margin: 8px 0 0 0;
  }
  & > div:not(:first-child) {
    text-align: center;
  }
  :hover {
    background-color: ${({ theme }) => theme.bg2};
  }

  @media screen and (min-width: ${MEDIA_WIDTHS.upToSmall}px) {
    /* flex-direction: row; */
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    row-gap: 12px;
  `};
`

const PrimaryPositionIdData = styled.div`
  width: 100%;
  display: flex;
  cursor: pointer;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  > * {
    margin-right: 8px;
  }
`

const AvatarImg = styled.div`
  img {
    width: 32px;
    height: 32px;
    border-radius: 32px;
  }
`

const SecondPart = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  > * {
    margin-right: 8px;
  }
`

const TradeInfo = styled.div`
  > span {
    display: block;
    text-align: right;
    font-size: 13px;
    color: #999;
    margin-bottom: 4px;
  }
`

const DataText = styled.div`
  font-weight: 600;
  font-size: 18px;
  line-height: 1.5;

  span,
  a {
    display: inline-block;
    vertical-align: middle;
  }

  img {
    display: inline-block;
    vertical-align: middle;
    width: 18px;
    height: 18px;
    margin-left: 8px;
    float: left;
  }

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 14px;
  `};
`

const VolText = styled.div`
  font-size: 16px
  text-align: right;
`

const AddressText = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: #999;
`

const StyledIdenticon = styled.div`
  height: 2rem;
  width: 2rem;
  border-radius: 2.125rem;
  background-color: ${({ theme }) => theme.bg4};
  font-size: initial;
`

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

interface FollowItemProps {
  address: string
  chainid: number
  name?: string
  image?: string
}

export default function FollowItem({ address, chainid, name, image }: FollowItemProps) {
  const { chainId } = useActiveWeb3React()

  console.log('followitem', address, image)

  const icon = useMemo(() => address && jazzicon(32, parseInt(address.slice(2, 10), 16)), [address])
  const iconRef = useRef<HTMLDivElement>(null)

  type ChainMap = { [chainId: number]: string }

  const ChainIdNameMap: ChainMap = {
    56: 'BSC',
    1: 'ETH',
  }

  const chainName: string = ChainIdNameMap[chainid]

  useLayoutEffect(() => {
    const current = iconRef.current
    if (icon) {
      current?.appendChild(icon)
      return () => {
        try {
          current?.removeChild(icon)
        } catch (e) {
          console.error('Avatar icon not found')
        }
      }
    }
    return
  }, [icon, iconRef])

  const [vol, setVol] = useState(0)
  const [toggle, setToggle] = useState(false)
  const [historyList, setHistoryList] = useState<TxInfo[]>()

  function formatVol(vol: number) {
    if (vol === 0) {
      return 0
    }
    return `$${Number(vol).toLocaleString('en-US')}`
  }

  function getTxList() {
    if (address && chainId) {
      const timestampNum = parseInt(((Number(new Date().getTime()) - 3600 * 24 * 90 * 1000) / 1000).toFixed(0))
      getUniswapTxList(address, chainId, timestampNum).then((res) => {
        let volInUsd = 0
        if (res && res.length !== undefined) {
          res.forEach((tx: TxInfo) => {
            volInUsd += Number(tx.amountUSD)
          })

          console.log('setHistoryList --- setVol')
          setHistoryList(res)
          setVol(volInUsd)
        }
      })
    }
  }

  useEffect(() => {
    getTxList()
  }, [address, chainId])

  return (
    <LinkRow>
      <RowBetween onClick={() => setToggle(!toggle)}>
        <PrimaryPositionIdData>
          <SecondPart>
            {image ? (
              <AvatarImg>
                <img src={image} alt="" />
              </AvatarImg>
            ) : (
              <StyledIdenticon>{<span ref={iconRef} />}</StyledIdenticon>
            )}
            <div>
              <DataText>
                <span>{name || address.slice(0, 6) + '...' + address.slice(-6)}</span>
                <a href={`https://fans3.5degrees.io/#/address/${address}/bsc`} target="_blank" rel="noreferrer">
                  <img src="https://tp-statics.tokenpocket.pro/logo/5degrees-logo.png" alt="" />
                </a>
              </DataText>
              <AddressText>{address}</AddressText>
            </div>
          </SecondPart>
          <TradeInfo>
            <span>Vol</span>
            <VolText>{formatVol(vol)}</VolText>
          </TradeInfo>
        </PrimaryPositionIdData>
      </RowBetween>
      {toggle && historyList && historyList.length ? (
        <SimpleWrap>
          {historyList.map((history, index) => {
            return <HistoryItem key={index} chainId={chainId} historyDetail={history}></HistoryItem>
          })}
        </SimpleWrap>
      ) : toggle ? (
        <EmptyWrap>
          <Trans>No Trade Info</Trans>
        </EmptyWrap>
      ) : (
        <></>
      )}
    </LinkRow>
  )
}
