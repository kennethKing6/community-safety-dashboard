var mysql = require('mysql');
var connection = mysql.createConnection(process.env.MYSQL_DATABASE);

module.exports = class MySQLBaseService{

    static isConnected = false

    static async createDBConnection(){
       const isConnected = new Promise(async (resolve,reject)=>{
            //Destroy existing connections to create new ones
          const hasTerminatedPrevConnection = await this.disconnectDBConnection()

          if(hasTerminatedPrevConnection) connection = mysql.createConnection(process.env.MYSQL_DATABASE);

            connection.connect((err)=>{
                if(err){
                    console.error('mysql database connnection error: ', err.stack)
                    this.isConnected = false;
                    reject(err)
                }
                this.isConnected = true;
                resolve()
            })
       })
       return await isConnected
    }

    /**
     * 
     * @param {string} sqlQueryString - the mysql query command
     * @returns {{results:object,fields:object} | null}
     */
    static async executeQuery(sqlQueryString){
        if(!this.isConnected) await this.createDBConnection()
        const result= new Promise((resolve,reject)=>{
            connection.query(sqlQueryString,(err,results,fields)=>{

                if(err)reject(err)

                resolve({
                    results:results,
                    fields:fields
                })
            })
        })

        return await result
    }

    static async disconnectDBConnection(){
        if(this.isConnected){
            await connection.off()
            await connection.destroy()
            this.isConnected = false
            return true
        }
        return false
    }
}
   