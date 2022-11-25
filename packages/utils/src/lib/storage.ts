type StorageResult = string | null;

abstract class Storage {
    abstract getItem(key: string): Promise<StorageResult>;
    abstract setItem(key: string, value: string): Promise<void>;
}

class SessionStorage extends Storage {
    constructor() {
        super();
    }

    getItem(key: string): Promise<StorageResult> {
        return new Promise((resolve, reject) => {
            resolve(sessionStorage.getItem(key));
        });
    }

    setItem(key: string, value: string): Promise<void> {
        return new Promise((resolve, reject) => {
            sessionStorage.setItem(key, value);
            resolve();
        });
    }
}

class LocalStorage extends Storage {
    constructor() {
        super();
    }

    getItem(key: string): Promise<StorageResult> {
        return new Promise((resolve, reject) => {
            resolve(localStorage.getItem(key));
        });
    }

    setItem(key: string, value: string): Promise<void> {
        return new Promise((resolve, reject) => {
            localStorage.setItem(key, value);
            resolve();
        });
    }
}

const StorageUtils = {
    sessionStorage: new SessionStorage(),
    localStorage: new LocalStorage(),
};

export default StorageUtils;
