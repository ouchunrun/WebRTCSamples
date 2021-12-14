
self.DBmanager = class DBmanager {
	constructor(dbName, storeName, version, index) {
		this.dbName = dbName;
		this.storeName = storeName;
		this.version = version || 1;
		this.index = index;
		this.currentDB = null;
		this.indexedDBOnOpen = false
		this.DAY_2_KEEP_LOGS = 7
	}

	/***
	 * create database
	 */
	openDB() {
		var request = self.indexedDB.open(this.dbName, this.version);
		request.onerror = function (e) {
			console.log(e.currentTarget.error.message);
		}.bind(this);

		request.onsuccess = function (e) {
			this.currentDB = e.target.result;
			console.log(this.currentDB.name + ' database is already opened!');
			this.indexedDBOnOpen = true
		}.bind(this);

		request.onupgradeneeded = function (e) {
			console.log('database version is already upgrade to ' + this.version);
			this.currentDB = e.target.result;
			if (!this.currentDB.objectStoreNames.contains(this.storeName)) {
				var objectStore = this.currentDB.createObjectStore(this.storeName, {keyPath: "phoneBookName"});

				// create index
				if(this.index && this.index.length > 0){
					this.index.forEach(function (item) {
						objectStore.createIndex(item, item);
					})
				}
			}
		}.bind(this);
	}

	/***
	 * get store by storeName
	 * @returns {IDBObjectStore}
	 */
	getStoreByName() {
		var objectStore = null
		if(this.currentDB && this.indexedDBOnOpen){
			try {
				objectStore = this.currentDB.transaction(this.storeName, 'readwrite').objectStore(this.storeName)
			}catch (e){
				console.warn('get objectStore error: ', e.message)
			}
		}else {
			console.log('indexedDB is not open now...')
		}
		return objectStore
	}

	/***
	 * add one data
	 * data should be an object
	 * @param data
	 */
	setItem(data) {
		var store = this.getStoreByName(this.storeName);

		if (store) {
			store.add(data);

			store.onsuccess = function (event) {
				console.log('Data write succeeded');
			};

			store.onerror = function (event) {
				console.log('Data write failed');
			}
		}
	}

	/***
	 * add more than one data
	 * data should be array
	 * @param items
	 */
	setItems(items){
		var store = this.getStoreByName(this.storeName);
		if (store) {
			for(var i = 0; i < items.length; i++){
				store.put(items[i]);
			}
		}
	}

	/***
	 * Get a piece of data by key value
	 * @param key  Index name
	 * @param value
	 */
	getItem (key, value) {
		var store = this.getStoreByName(this.storeName);
		if(store){
			var index = store.index(key);
			var request = index.get(value);

			request.onsuccess = function( e) {
				if ( request.result) {
					console.log(request.result);
				} else {
					console.log('未获得数据记录');
				}
			};
		}
	}

	/***
	 * get all items
	 */
	getAllItems(callback) {
		var store = this.getStoreByName(this.storeName);
		if(store){
			var request = store.openCursor();
			var result = []
			request.onsuccess = function (event) {
				var cursor = event.target.result;
				if (cursor) {
					result.push(cursor.value)
					cursor.continue();
				} else {
					console.log('没有更多数据了！');
					callback?.(result)
				}
			};
		}
	}

	/***
	 * delete items
	 * Save data within 30 days by default
	 */
	deleteItems(time = this.DAY_2_KEEP_LOGS) {
		var store = this.getStoreByName(this.storeName);
		if(store){
			console.log('delete ' + this.currentDB.name +' db data within ' + time + ' days')
			var request = store.openCursor();
			request.onsuccess = function (event) {
				var cursor = event.target.result;
				var dateTimeStamp = 1000 * 60 * 60 * 24 * time
				var nowTimeStamp = new Date().getTime()

				if (cursor) {
					var TS = cursor.value.TS
					if(nowTimeStamp - TS >= dateTimeStamp){
						store.delete(cursor.value.id)
						cursor.continue();
					}else {
						console.log('Delete complete.')
					}
				} else {
					console.log('Delete complete!');
				}
			};
		}
	}

	/***
	 * update data
	 * @param newItem
	 */
	update(newItem) {
		var store = this.getStoreByName(this.storeName);
		if(store){
			store.put(newItem);

			store.onsuccess = function (event) {
				console.log('data update success');
			};

			store.onerror = function (event) {
				console.log('data update failed');
			}
		}
	}

	clear () {
		var store = this.getStoreByName(this.storeName);
		if(store){
			var request = store.clear();

			request.onsuccess = function (event) {
				console.log('clear Success');
			};
			request.onerror = function (event) {
				console.log('clear Error');
			};
		}
	}
};
