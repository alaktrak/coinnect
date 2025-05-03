import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Section from './components/Section'
import Product from './components/Product'

// ABIs
import Dappazon from './abis/Dappazon.json'

// Config
import config from './config.json'

function App() {
  const [provider, setProvider] = useState(null)

  const [dappazon, setDappazon] = useState(null) 

  const [account, setAccount] = useState(null)

  const [Personal, setPersonal] = useState(null)
  const [Academics, setAcademics] = useState(null)
  const [Research, setResearch] = useState(null)

  const [item, setItem] = useState({})
  const [toggle, setToggle] = useState(false)

  const togglePop = (item) => {
    setItem(item)
    toggle ? setToggle(false) : setToggle(true)
  }

  const loadBlockchainData = async () => {
      //Connect to Blockchain
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      setProvider(provider)

      const network = await provider.getNetwork()
      console.log(network)

      //Connect to Smart Contracts (Create J5 Versions)
      const dappazon = new ethers.Contract(config[network.chainId].dappazon.address, Dappazon, provider)

      setDappazon(dappazon)

      //Load Products

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
      
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div>

      <Navigation account={account} setAccount={setAccount}/>

      <h2>Coinnect Best Sellers</h2>

      {Personal && Academics && Research && (
        <>
        <Section title={"Academic Services"} items={Academics} togglePop={togglePop}/>
        <Section title={"Personal Services"} items={Personal} togglePop={togglePop}/>
        <Section title={"Research Services"} items={Research} togglePop={togglePop}/>
        </>
      )}

      {toggle && (
        <Product item={item} provider = {provider} account = {account} dappazon = {dappazon} togglePop={togglePop}/>
      )}

    </div>
  );
}

export default App;
