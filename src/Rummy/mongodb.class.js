module.exports={

	findData:(tbName,filter,project,sort,callback)=>{

		 db.collection(tbName).find(filter).project(project).sort(sort).toArray((err,tbData)=>{

		 	if(!err && tbData.length > 0){

		 		callback(tbData)

		 	}else{
		 		callback(false)
		 	}
		 })

	},
	findDataOne:(tbName,filter,project,sort,callback)=>{

		db.collection(tbName).find(filter).project(project).sort(sort).toArray((err,tbData)=>{
		
		 	if(!err && tbData.length > 0){

		 		callback(tbData[0])
		 		
		 	}else{
		 		callback(false)
		 	}

		 })
	},
	updateData:(tbName,filter,update,options,callback)=>{

		db.collection(tbName).update(filter,update,options,(err,upData)=>{

		 	if(!err && upData){

		 		callback(true)
		 		
		 	}else{
		 		callback(false)
		 	}

		 })


	},
	updateDataOne:(tbName,filter,update,options,callback)=>{
		
		db.collection(tbName).updateOne(filter,update,options,(err,upData)=>{

		 	if(!err && upData){

		 		callback(true)
		 		
		 	}else{
		 		callback(false)
		 	}

		})

	},
	findAndModify:(tbName,filter,update,options,callback)=>{

		db.collection(tbName).findAndModify(filter,{},update,options,(err,upData)=>{

		 	if(!err && upData.value != null){
		 		callback(upData.value)
		 	}else{
		 		callback(false)
		 	}
		})
	}

}