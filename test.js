var price_1 = "100.00",
	price_2 = "1,231.11",
	price_3 = ".50",
	price_4 = "1.50";


function makeFloat(num){
		return Math.round(parseFloat(num.replace(/,/,"")) * 100);
	}

console.info(makeFloat(price_1));
console.info(makeFloat(price_2));
console.info(makeFloat(price_3));
console.info(makeFloat(price_4));