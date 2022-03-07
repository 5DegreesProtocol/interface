import { Trans } from '@lingui/macro'
import { AutoColumn } from 'components/Column'
import FollowItem from 'components/FollowItem'
import { RowBetween } from 'components/Row'
import { useActiveWeb3React } from 'hooks/web3'
import { useEffect, useState } from 'react'
import styled from 'styled-components/macro'
import { ThemedText } from 'theme'

import { getFollowList, getPopularList } from '../../utils/getFollowList'

const PageWrapper = styled(AutoColumn)`
  max-width: 870px;
  width: 100%;
  ${({ theme }) => theme.mediaWidth.upToMedium`
    max-width: 800px;
  `};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    max-width: 500px;
  `};
`
const TitleRow = styled(RowBetween)`
  color: ${({ theme }) => theme.text2};
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-wrap: wrap;
    gap: 12px;
    width: 100%;
  `};
`

const MainContentWrapper = styled.main`
  background-color: ${({ theme }) => theme.bg0};
  padding: 8px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
`

export default function Follow() {
  interface IFollowItem {
    address: string
    followChainId: number
    name?: string
    image?: string
  }
  const { account, chainId } = useActiveWeb3React()

  const [myFollows, setMyFollows] = useState<IFollowItem[]>([])

  const [popularFollows, setPopFollows] = useState<string[]>([])

  function getMyFollows() {
    account &&
      getFollowList(account).then((res) => {
        if (res && res.length) {
          console.log('setmyfollow', res)
          setMyFollows(res)
        }
      })
  }
  function getPopularFollows() {
    getPopularList(chainId).then((res) => {
      if (res && res.length) {
        setPopFollows(res)
      }
    })
  }

  useEffect(() => {
    getMyFollows()
    getPopularFollows()
  }, [account, chainId])

  console.log('render list')

  return (
    <>
      <PageWrapper>
        <AutoColumn gap="lg" style={{ width: '100%' }}>
          <TitleRow padding={'0'}>
            <ThemedText.Body fontSize={'20px'}>
              <Trans>You</Trans>
            </ThemedText.Body>
            <Trans>Recent 20 transactions in 3 months</Trans>
          </TitleRow>
          <MainContentWrapper>
            {account && chainId ? <FollowItem key={account} address={account} chainid={chainId} /> : <></>}
          </MainContentWrapper>

          <TitleRow padding={'0'}>
            <ThemedText.Body fontSize={'20px'}>
              <Trans>Your Followings</Trans>
            </ThemedText.Body>
          </TitleRow>

          <MainContentWrapper>
            {myFollows.map((follow) => {
              return (
                <FollowItem
                  key={follow.address + follow.followChainId}
                  image={follow.image}
                  name={follow.name}
                  address={follow.address}
                  chainid={follow.followChainId}
                />
              )
            })}
          </MainContentWrapper>

          <TitleRow padding={'0'}>
            <ThemedText.Body fontSize={'20px'}>
              <Trans>Trending</Trans>
            </ThemedText.Body>
          </TitleRow>

          <MainContentWrapper>
            {popularFollows.map((follow) => {
              return <FollowItem key={follow} address={follow} chainid={chainId || 1} />
            })}
          </MainContentWrapper>
        </AutoColumn>
      </PageWrapper>
    </>
  )
}
