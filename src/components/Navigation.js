import { ethers } from 'ethers';

const Navigation = ({ account, setaccount }) => {
    const connectHandler=async()=>{
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });
          const account = ethers.utils.getAddress(accounts[0]);
          setaccount(account); 
    }
    return (
        <nav>
            <div className='nav__brand'>
                <h1>EcomTiX</h1>
            </div>
            <input type='text' className='nav__search'/>
            {
                account ? (
                    <button type='button' className='nav__connect'>{account.slice(0,6)+'....'+account.slice(38,41)}</button>
                ):(
                    <button type='button' className='nav__connect' onClick={connectHandler}>connect</button>
                )
            }
            <ul className='nav__links'>
                <li><a href='#Clothing & Jewelry'>Clothing & Jewelry</a></li>
                <li><a href='#Electronics & Gadgets'>Electronics & Gadgets</a></li>
                <li><a href='#Toys & Gaming'>Toys & Gaming</a></li>

            </ul>
        </nav>
    );
}

export default Navigation;