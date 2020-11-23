const flatStr = require('./flatStr')
let Validator = require('jsonschema').Validator

/* An example of custom format
Validator.prototype.customFormats.status = input => {
	const validStatus = [ 'draft' , 'approvedwip' , 'approved' ]
  return validStatus.includes( flatStr( input ) )
}
*/

let validator = new Validator()

const processMapMetaDataSchema = {
	id: "/ProcessMapMetaData",
	type: "object",
	properties:{
		ProcessId: { type: "string" },
		ProcessTitle: { type: "string" },
		Level: { type: "string" },
		PageUrl: { type: "string" },
		ParentId: { type: "string" },
		Owner: { type: "string" },
		DocumentNr: { type: "string" },
		Revision: { type: "string" },
		Date: { type: "string" },
		Inputs: { type:"array" , items: { type: "string" } },
		Outputs: { type:"array" , items: { type: "string" } },
		Swimlanes: { type:"array" , items: { type: "string" } },
		Tasks: { type:"array" , items: { type: "string" } },
		Links: { type:"array" , items: { 
			type: "object" , "properties" : { 
				title: { type: "string" },
				href: { type: "string" }
			 } 
		} },
		FullText: { type: "string" }
	},
	required:[ 'ProcessId' , 'ProcessTitle' ]
}

module.exports = {
	processMapMetaDataSchema,
	validator
}
