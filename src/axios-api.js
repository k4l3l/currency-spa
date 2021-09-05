import axios from 'axios';

export const api = {
    async getAllRates(currStringArr) {
        const ax = axios.create({
            baseURL: "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/",            
            timeout: 1000
        });
        const reqArr = currStringArr.map(c => {
            return ax.get(c);
        });        
        return await axios.all(reqArr);
        // return await ax.all(reqArr)
        // .then(res => {
        //     console.log(res);
        // })
        // .catch(err => console.log(err));
    }
}