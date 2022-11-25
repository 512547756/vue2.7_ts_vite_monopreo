export default {
    _map: new Map<string, Array<(params: any) => any>>(),
    addObserve(key: string, action: (params: any) => any) {
        let actions = this._map.get(key);
        if (actions) {
            actions.push(action);
        } else {
            actions = [action];
        }
        this._map.set(key, actions);
    },
    removeObserve(key: string) {
        if (this._map.has(key)) {
            this._map.delete(key);
        }
    },
    post(key: string, params?: any) {
        if (this._map.has(key)) {
            const actions = this._map.get(key);
            actions?.forEach((action) => {
                action(params);
            });
        }
    },
};
