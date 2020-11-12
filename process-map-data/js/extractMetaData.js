const Cheerio = require( 'cheerio' )
const flatStr = require('./flatStr')
const { processMapMetaDataSchema , validator } = require('./processMapMetaDataValidator')

function extractMetaData( strXML ){

	let metaData = {}

	let metaDataProps = new Map()
	for( const property of Object.getOwnPropertyNames( processMapMetaDataSchema.properties ) ){  metaDataProps.set( flatStr( property ) , property ) }

	const $ = Cheerio.load( strXML , { ignoreWhitespace: true , xmlMode: true } )

	// Extract all text elements
	if( metaDataProps.has( flatStr( 'fulltext' ) ) ){
		let text = ''
		$( 'text' ).map( ( index , textTag ) => text.concat( $( textTag ).text() , ' ' ) )
		metaData[ metaDataProps.get( flatStr( 'fulltext' ) ) ] = text
	}
	// Extract all hyper-links
	if( metaDataProps.has( flatStr( 'links' ) ) && processMapMetaDataSchema.properties[ metaDataProps.get( flatStr( 'links' ) ) ].type == 'array' ){
		metaData[ metaDataProps.get( flatStr( 'links' ) ) ] = []
		$( 'a' ).map( ( index , aTag ) => { 
			metaData[ metaDataProps.get( flatStr( 'links' ) ) ].push( {
				title: $( aTag ).find( 'text' ).text(),
				href: $( aTag ).attr( 'xlink\:href' )
			} ) 
		})
	}

	/* To extract meta data from a SVG file will search within typical groups configuration like the one below.
		PROPERTY_NAME and PROPERTY_VALUE indicate the locations where the meta data will be extracted from.

		<g id="..." ... >
			...
			<v:custProps>
				<v:cp v:lbl="Active Shape" v:nameU="MetaData" v:val="VT4( PROPERTY_NAME )" ... />
			</v:custProps>
			...
			<text ...> PROPERTY_VALUE </text>
		</g>
	*/
	$( 'v\\:cp' ).map( ( index , cpTag ) => {
		if( flatStr( $( cpTag ).attr( 'v\:lbl' ) ) == 'activeshape' ){
			let gTag = $( cpTag ).closest( 'g' )[0] ? $( cpTag ).closest( 'g' )[0] : null
			if( gTag ){
				let name = $( cpTag ).attr( 'v\:nameU' )
				let val  = $( cpTag ).attr( 'v\:val' ).match( /^\w+\(([\w,_-\s\.]+)\)/ )
				let text = $( gTag ).find( 'text' ).text()
				if( val && val.length > 1 ){ val=val[1] }
				if( name && val && flatStr( name ) == 'metadata' ){
					if( metaDataProps.has( flatStr( val ) ) ){
						metaData[ metaDataProps.get( flatStr( val ) ) ] = text
					} 
					if( metaDataProps.has( flatStr( val + 's' ) ) && processMapMetaDataSchema.properties[ metaDataProps.get( flatStr( val + 's' ) ) ].type == 'array' ){
						if( !Array.isArray( metaData[ metaDataProps.get( flatStr( val + 's' ) ) ] ) ){
							metaData[ metaDataProps.get( flatStr( val + 's' ) ) ] = []
						}
						metaData[ metaDataProps.get( flatStr( val + 's' ) ) ].push( text )
					}
				}
			}
		}
	} )
	return validator.validate( metaData , processMapMetaDataSchema )	
}

module.exports = extractMetaData
