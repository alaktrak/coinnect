import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Section from './components/Section'
import Product from './components/Product'

// ABIs
import Dappazon from './abis/Dappazon.json'
import mCONCT from './abis/mCONCT.json' // Add the token ABI import

// Config
import config from './config.json'

function App() {
  const [provider, setProvider] = useState(null)
  const [dappazon, setDappazon] = useState(null) 
  const [token, setToken] = useState(null) // New state for token contract
  const [account, setAccount] = useState(null)

  const [Personal, setPersonal] = useState(null)
  const [Academics, setAcademics] = useState(null)
  const [Research, setResearch] = useState(null)

  const [tokenBalance, setTokenBalance] = useState(0) // Track user's token balance
  const [item, setItem] = useState({})
  const [toggle, setToggle] = useState(false)

  const togglePop = (item) => {
    setItem(item)
    toggle ? setToggle(false) : setToggle(true)
  }

  const loadBlockchainData = async () => {
    // Connect to Blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    const network = await provider.getNetwork()
    console.log(network)

    // Connect to Smart Contracts (Create JS Versions)
    const dappazon = new ethers.Contract(
      config[network.chainId].dappazon.address, 
      Dappazon, 
      provider
    )
    setDappazon(dappazon)

    // Connect to mCONCT token contract
    // Use paymentToken as a property, not a function
    try {
      const tokenAddress = await dappazon.paymentToken()
      console.log("Token address:", tokenAddress)
      
      const token = new ethers.Contract(
        tokenAddress,
        mCONCT,
        provider
      )
      setToken(token)
    } catch (error) {
      console.error("Error getting payment token:", error)
      // Alternative approach if paymentToken is a state variable, not a function
      try {
        const tokenAddress = await provider.getStorageAt(dappazon.address, 1) // slot 1 might store paymentToken
        // Clean up the address (remove padding)
        const cleanAddress = "0x" + tokenAddress.slice(26)
        console.log("Token address (from storage):", cleanAddress)
        
        const token = new ethers.Contract(
          cleanAddress,
          mCONCT,
          provider
        )
        setToken(token)
      } catch (secondError) {
        console.error("Error getting token from storage:", secondError)
      }
    }

    // Load Products
    const items = []

    for (var i = 0; i < 9; i++) {
      const item = await dappazon.items(i + 1)
      items.push(item)
    }

    const Personal = items.filter((item) => item.category === 'Personal')
    const Academics = items.filter((item) => item.category === 'Academics')
    const Research = items.filter((item) => item.category === 'Research')

    setPersonal(Personal)
    setAcademics(Academics)
    setResearch(Research)
    
    // Get account from metamask on load if already connected
    window.ethereum.request({ method: 'eth_accounts' })
      .then(accounts => {
        if (accounts.length > 0) {
          const account = ethers.utils.getAddress(accounts[0])
          setAccount(account)
          
          // Load token balance for connected account
          loadTokenBalance(token, account)
        }
      })
      
    // Listen for account changes
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length > 0) {
        const account = ethers.utils.getAddress(accounts[0])
        setAccount(account)
        
        // Update token balance when account changes
        loadTokenBalance(token, account)
      } else {
        setAccount(null)
        setTokenBalance(0)
      }
    })
  }
  
  // Function to load token balance
  const loadTokenBalance = async (tokenContract, account) => {
    if (!tokenContract || !account) return
    
    try {
      const balance = await tokenContract.balanceOf(account)
      setTokenBalance(balance)
    } catch (error) {
      console.error("Error loading token balance:", error)
    }
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  // Update balance when account changes
  useEffect(() => {
    if (token && account) {
      loadTokenBalance(token, account)
    }
  }, [token, account])

  return (
    <div>
      <Navigation 
        account={account} 
        setAccount={setAccount} 
        tokenBalance={tokenBalance}
        tokenSymbol={token ? 'mCONCT' : 'CONCT'}
      />

      <h2>Coinnect Best Sellers</h2>

      {Personal && Academics && Research && (
        <>
        <Section title={"Academic Services"} items={Academics} togglePop={togglePop} tokenSymbol="mCONCT"/>
        <Section title={"Personal Services"} items={Personal} togglePop={togglePop} tokenSymbol="mCONCT"/>
        <Section title={"Research Services"} items={Research} togglePop={togglePop} tokenSymbol="mCONCT"/>
        </>
      )}

      {toggle && (
        <Product 
          item={item} 
          provider={provider} 
          account={account} 
          dappazon={dappazon}
          token={token}
          tokenBalance={tokenBalance}
          setTokenBalance={setTokenBalance}
          togglePop={togglePop}
        />
      )}
    </div>
  );
}

export default App;