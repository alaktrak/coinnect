import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Rating from './Rating'
import close from '../assets/close.svg'

const Product = ({ item, provider, account, dappazon, token, tokenBalance, setTokenBalance, togglePop }) => {
  const [order, setOrder] = useState(null)
  const [hasBought, setHasBought] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [needsApproval, setNeedsApproval] = useState(true)

  const checkAllowance = async () => {
    if (!token || !account || !dappazon) return
    
    try {
      const allowance = await token.allowance(account, dappazon.address)
      setNeedsApproval(allowance.lt(item.cost))
    } catch (error) {
      console.error("Error checking allowance:", error)
      setNeedsApproval(true)
    }
  }
  
  const approveHandler = async () => {
    if (!token || !account || !dappazon) return
    
    setIsApproving(true)
    
    try {
      const signer = await provider.getSigner()
      
      // Approve tokens for spending
      const txResponse = await token.connect(signer).approve(
        dappazon.address,
        item.cost
      )
      
      await txResponse.wait()
      
      // Update approval status
      setNeedsApproval(false)
      
    } catch (error) {
      console.error("Error approving tokens:", error)
    }
    
    setIsApproving(false)
  }

  const buyHandler = async () => {
    if (!dappazon || !account) return
    
    try {
      const signer = await provider.getSigner()

      // Buy item using tokens
      let transaction = await dappazon.connect(signer).buy(item.id)
      await transaction.wait()

      // Update token balance after purchase
      if (token) {
        const newBalance = await token.balanceOf(account)
        setTokenBalance(newBalance)
      }
      
      setHasBought(true)
      setNeedsApproval(true) // Reset approval state for future purchases
      
    } catch (error) {
      console.error("Error buying item:", error)
    }
  }

  const getItemDescription = (name) => {
    switch (name) {
      case 'Tutors':
        return "Personalized education support to help students excel academically and build confidence across all subjects and grade levels";
      case 'Babysitters':
        return "Trusted and caring babysitters who ensure your child's safety, happiness, and well-being while you're away.";
      case 'Dog Walkers':
        return "Reliable dog walkers who provide exercise, companionship, and care for your furry friends.";
      case 'Cleaning Services':
        return "Professional cleaning services to keep your home or office spotless, fresh, and inviting.";
      case 'Moving Services':
        return "Stress-free moving solutions, from packing to transportation, making your relocation smooth and efficient.";
      case 'Realtors':
        return "Expert real estate agents who help you buy, sell, or rent properties with personalized guidance and market expertise.";
      case 'Handyman':
        return "Skilled handymen ready to tackle repairs, installations, and home improvement projects quickly and reliably.";
      case 'Landscapers':
        return "Transform your outdoor spaces with professional landscaping, gardening, and maintenance services.";
      case 'Accountants':
        return "Experienced accountants offering financial planning, tax preparation, and business consulting to keep your finances on track.";
      default:
        return "An amazing product you won't want to miss!";
    }
  }

  useEffect(() => {
    const fetchDetails = async () => {
      if (!dappazon || !account) return
      
      const events = await dappazon.queryFilter("Buy")
      const orders = events.filter(
        (event) => event.args.buyer === account && event.args.itemId.toString() === item.id.toString()
      )

      if (orders.length === 0) return

      const order = await dappazon.orders(account, orders[0].args.orderId)
      setOrder(order)
    }

    fetchDetails()
  }, [hasBought, dappazon, account, item.id])
  
  // Check token allowance when component mounts or dependencies change
  useEffect(() => {
    checkAllowance()
  }, [token, account, dappazon, item.cost, hasBought])
  
  // Check if user has sufficient token balance
  const hasInsufficientBalance = tokenBalance && item.cost && tokenBalance.lt(item.cost)

  return (
    <div className="product">
      <div className="product__details">
        <div className="product__image">
          <img src={item.image} alt="Product" />
        </div>
        <div className="product__overview">
          <h1>{item.name}</h1>

          <Rating value={item.rating} />

          <hr />

          <p>{item.address}</p>

          <h2>{ethers.utils.formatUnits(item.cost.toString(), 'ether')} mCONCT</h2>

          <hr />

          <h2>Overview</h2>

          <p>{getItemDescription(item.name)}</p>
        </div>

        <div className="product__order">
          <h1>{ethers.utils.formatUnits(item.cost.toString(), 'ether')} mCONCT</h1>

          <p>
            FREE delivery <br />
            <strong>
              {new Date(Date.now() + 345600000).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </strong>
          </p>

          {item.stock > 0 ? (
            <p>In Stock.</p>
          ) : (
            <p>Out of Stock.</p>
          )}
          
          {hasInsufficientBalance && (
            <p className="error">Insufficient mCONCT balance</p>
          )}
          
          {!account ? (
            <p>Connect wallet to purchase</p>
          ) : needsApproval ? (
            <button 
              className='product__buy' 
              onClick={approveHandler}
              disabled={isApproving || hasInsufficientBalance}
            >
              {isApproving ? 'Approving...' : 'Approve mCONCT'}
            </button>
          ) : (
            <button 
              className='product__buy' 
              onClick={buyHandler}
              disabled={hasInsufficientBalance}
            >
              Buy Now
            </button>
          )}

          <p><small>Ships from</small> Coinnect</p>
          <p><small>Sold by</small> Coinnect</p>
          
          {account && (
            <p><small>Your balance:</small> {tokenBalance ? ethers.utils.formatUnits(tokenBalance.toString(), 'ether') : '0'} mCONCT</p>
          )}

          {order && (
            <div className='product__bought'>
              Item bought on <br />
              <strong>
                {new Date(Number(order.time.toString() + '000')).toLocaleDateString(
                  undefined,
                  {
                    weekday: 'long',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric'
                  })}
              </strong>
            </div>
          )}
        </div>

        <button onClick={togglePop} className="product__close">
          <img src={close} alt="Close" />
        </button>
      </div>
    </div>
  );
}

export default Product;