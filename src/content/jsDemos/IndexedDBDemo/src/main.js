/* Log Debug Start */
let log = {}
log.debug = window.debug('indexedDB:DEBUG')
log.log = window.debug('indexedDB:LOG')
log.info = window.debug('indexedDB:INFO')
log.warn = window.debug('indexedDB:WARN')
log.error = window.debug('indexedDB:ERROR')
/* Log Debug End */


window.onload = function (){
	log.info('window onload ...')
	let index = 0
	let testInterval = setInterval(function (){
		log.info('print test index ' + index)
		index++

		if(index === 50){
			log.warn('clear test Interval')
			clearInterval(testInterval)
		}
	}, 10)

	window.dbExport = new DBExport(true)
}
