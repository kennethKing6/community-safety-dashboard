var mysql = require('mysql');



module.exports = class MySQLBaseService{

    static connection;
    static isConnected = false;

    /**
     * initializes a connection to a mysql database
     * 
     * @returns {boolean} true if connected to the database and false when not connected
     */
    static async createDBConnection(){
    
        if(!this.connection){
            this.connection =  mysql.createConnection({
                host: process.env.MYSQL_HOSTNAME,
                user: process.env.MYSQL_USERNAME,
                password:process.env.MYSQL_PASSWORD,
                database:process.env.MYSQL_DATABASE,
                port:process.env.MYSQL_PORT,
              });
              
        }
       const isConnected = new Promise(async (resolve,reject)=>{
            //Destroy existing connections to create new ones
          const hasTerminatedPrevConnection = await this.disconnectDBConnection()

          if(hasTerminatedPrevConnection) this.connection = mysql.createConnection(process.env.MYSQL_DATABASE);

            this.connection.connect((err)=>{
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
     * Executes MYSQL query commands to the database
     * 
     * @param {string} sqlQueryString - the mysql query command
     * @returns {{results:object,fields:object} | null} results is the data/void from the query 
     *                                                  the fields represents the db column from the query
     */
    static async executeQuery(sqlQueryString){
        if(!this.connection)
        if(!this.isConnected) await this.createDBConnection()
        const result= new Promise((resolve,reject)=>{
            this.connection.query(sqlQueryString,(err,results,fields)=>{

                if(err)reject(err)

                resolve({
                    results:results,
                    fields:fields
                })
            })
        })

        return await result
    }

    /**
     * Disconnects the app to the mysql database
     * 
     * @returns {boolean} true when the disconnection to the database was successful. False otherwise
     */
    static async disconnectDBConnection(){
        if(this.isConnected){
            await this.connection.off()
            await this.connection.destroy()
            this.connection = null;
            this.isConnected = false
            return true
        }
        return false
    }
}
   