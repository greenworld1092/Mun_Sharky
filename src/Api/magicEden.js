import nft1 from '../Utility/test/nft1.json';
import nft2 from '../Utility/test/nft2.json';
import nft3 from '../Utility/test/nft3.json';

const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

export const GetCollectionList = async () => {
	//https://stats-mainnet.magiceden.io/collection_stats/popular_collections/sol?limit=1000&window=1d
	
	return await fetch(proxyUrl + "https://api-mainnet.magiceden.dev/v2/collections?offset=0&limit=500", {method: "GET", headers: {
		'X-Requested-With': 'XMLHttpRequest'
	  }}).then(response => response.json())
	.catch(error => console.log(error));
}

export const getCollectionStats = async(collectionSymbol) => {
	return await fetch(proxyUrl + "https://api-mainnet.magiceden.dev/v2/collections/" + collectionSymbol + "/stats", {method: "GET", headers: {
		'X-Requested-With': 'XMLHttpRequest'
	  }})
	.then(response => response.json())
	.catch(error => console.log(error));
}

export const getNFTInfoByMintAddress = async(mintAddress) => {
	//api-devnet.magiceden.dev/v2/tokens/4uvpqEL73361hRXCrHqBZQWeqfbKPQw55yKSFZvLQYTq
//	return await fetch("https://api-mainnet.magiceden.dev/v2/tokens/" + mintAddress, {method: "GET"}).then(res => res.json());
	return nft3;
	if(Math.floor(Math.random() * 10) % 2 == 0)
		return nft1;
	else
		return nft2;
	throw new Error('Something went wrong');
}