import StorageUtils from "../lib/storage";
const { localStorage } = StorageUtils;

export default (config: any) => {
    localStorage.getItem("ACCESS_TOKEN").then((token) => {
        config.headers["X-Access-Token"] = token;
    });

    return config;
};
