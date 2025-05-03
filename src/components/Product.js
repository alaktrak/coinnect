import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Rating from './Rating'
import close from '../assets/close.svg'

const Product = ({ item, provider, account, dappazon, togglePop }) => {
  const [order, setOrder] = useState(null)
  const [hasBought, setHasBought] = useState(false)

  const buyHandler = async () => {
    const signer = await provider.getSigner()

    // Buy item...
    let transaction = await dappazon.connect(signer).buy(item.id, { value: item.cost })
    await transaction.wait()

    setHasBought(true)
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

          <h2>{ethers.utils.formatUnits(item.cost.toString(), 'ether')} ETH</h2>

          <hr />

          <h2>Overview</h2>

          <p>{getItemDescription(item.name)}</p>
        </div>

        <div className="product__order">
          <h1>{ethers.utils.formatUnits(item.cost.toString(), 'ether')} ETH</h1>

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

          <button className='product__buy' onClick={buyHandler}>
            Buy Now
          </button>

          <p><small>Ships from</small> Amazoken</p>
          <p><small>Sold by</small> Amazoken</p>

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
