import { ethers } from 'ethers';

const Navigation = ({ account, setAccount, tokenBalance, tokenSymbol }) => {

    const connectHandler = async() => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        const account = ethers.utils.getAddress(accounts[0])
        setAccount(account)
    }

    return (
        <nav>
            <div className='nav__brand' style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src="/Coinnect.jpeg" alt="Logo" style={{ height: '100px' }} />
            </div>

            <input
                type='text'
                className="nav__search"
                placeholder="Search services..."
            />
            
            {account ? (
                <div className="nav__account">
                    <button
                        type="button"
                        className='nav__connect'
                    >
                        {account.slice(0, 6) + '...' + account.slice(38, 42)}
                    </button>
                    {tokenBalance && (
                        <span className="token__balance">
                            {ethers.utils.formatUnits(tokenBalance.toString(), 'ether')} {tokenSymbol}
                        </span>
                    )}
                </div>
            ) : (
                <button
                    type="button"
                    className='nav__connect'
                    onClick={connectHandler}
                >
                    Connect
                </button>
            )}
           
            <ul className='nav__links'>
                <li><a href="#Personal">Personal</a></li>
                <li><a href="#Academics">Academics</a></li>
                <li><a href="#Research">Research</a></li>
            </ul>

        </nav>
    );
}

export default Navigation;