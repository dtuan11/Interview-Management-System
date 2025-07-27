import axios from "axios";



export async function myRequest(url:string, token:string) {
    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status !== 200) {
            throw new Error(`Network response for ${url} was not ok`);
        }

        return response.data;
    } catch (error:any) {
        throw new Error(`Fetch error: ${error.message}`);
    }
}
