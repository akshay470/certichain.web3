import axios from "axios";

const pinata = {
  upload: {
    file: async (formData) => {
      const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
      const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI3YjE3ODE3ZS0yMDZhLTQ5MTUtODNlMS1hMDA1YjQyY2ViMjYiLCJlbWFpbCI6ImFrc2hhai5zb25hckBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNzA1YWEyYWQyMGFmNTViMmIyOTYiLCJzY29wZWRLZXlTZWNyZXQiOiJhZDQyODc3MzEzZjRhMzdlMWM5NDAyZWRhOGZjM2IzOGEyODBjMzUxZGQ0OTkwYTQ2Y2M4MjY2ZmRjZmNlYzVjIiwiZXhwIjoxNzc1NDExODI4fQ.JqQ7YZaBZQuRokW02bsyDJ9gVpGERzI2rHF3R5bmR-Q";

      if (!jwt) {
        throw new Error("Pinata JWT is missing");
      }

      const response = await axios.post(url, formData, {
        maxContentLength: Infinity,
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${jwt}`,
        },
      });

      return response.data;
    },
  },
};

export default pinata;
