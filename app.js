var express = require('express');

const app = express();
var BN = require('bn.js')
var abi = require('ethereumjs-abi')
const eutil = require('ethereumjs-util');
var nodemailer = require('nodemailer');
let accounts;
let email;
let amount;
let contract;

const exphbs = require('express-handlebars')
//const passport = require('passport');
//var session = require('express-session')
var path = require('path')
var bodyParser = require('body-parser')
const flash = require('connect-flash');
// All route file
// var index = require('./routes/index');
// var deploy = require('./routes/deploy');




// Inject handlebar 
app.engine('handlebars', exphbs({
//   helpers : {
//     truncate : truncate,
//     stripTags:stripTags
//   },
  defaultLayout:'main'}));
app.set('view engine', 'handlebars')
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname,'public')));

// Express session
// app.use(session({
//   secret : 'Secret',
//   resave:true,
//   saveUninitialized:true
// }))

//Passport middleware
// app.use(passport.initialize());
// app.use(passport.session());

// Flash message middleware
// app.use(flash());
// app.use(function(req,res,next){
//   res.locals.sucess_msg = req.flash('sucess_ms');
//   res.locals.error_msg = req.flash('error_ms');
//   res.locals.errors = req.flash('error');
  
//   // if you are login you can get the user by req.user as we store in serialable in config/passport in case of googleLogin and config/localpassport in case of simple login
// //   res.locals.user = req.user || null;
//   next();
// });

//All route middleware
// app.use('/auth',googleSignIn);
// app.use('/',index);
// app.use('/our',deploy);
app.get('/paymentchannel',function(req,res,next){
   
    
    res.render('index/welcome')

  })
  

  app.get('/verify/signature',function(req,res,next){
   
    
    res.render('index/sign')

  })

app.post('/open/channel',async function(req,res,next){
    email = req.body.email;
    amount = req.body.amount;

    console.log("email ",email)


  var HDWalletProvider = require("truffle-hdwallet-provider");
  var mnemonic = "diet mistake resist blood pool process toss frequent zero judge crime equip"; // 12 word mnemonic
  const Web3 = require('web3');
  const {interface,bytecode}  = require ('./compile');
  //const bytecode = a.contracts[':Inbox'].bytecode;
  
  var provider = new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/4e962d53cc894df2a63436f519d1e9d0");
  
  const web3 = new Web3(provider);

accounts  = await web3.eth.getAccounts();
console.log("used address to deployee contract " ,accounts);



const result = await new web3.eth.Contract(JSON.parse(interface))
.deploy({ data : bytecode, arguments: [req.body.rec,req.body.dur] })//prepare deployee contract
.send({ 
  from: accounts[0], 
  value : web3.utils.toWei(req.body.amount,'ether'),
  gas: '3000000'
});
console.log("result is",result);
console.log("contract deployee to addrsss ", result.options.address);
contract = result.options.address;


a = web3.utils.toWei(req.body.amount,'ether')
console.log("contract deploy successfully",a)




signPayment(result.options.address,a,function(err,signer){

 

});















  res.render('index/welcome')

})


function constructPaymentMessage(contractAddress, amount) {
  
  return abi.soliditySHA3(
    ["address", "uint256"],
    [contractAddress, amount],
  );
  
}

async function signMessage(message, callback) {
  var HDWalletProvider = require("truffle-hdwallet-provider");
  var mnemonic = "diet mistake resist blood pool process toss frequent zero judge crime equip"; // 12 word mnemonic
  const Web3 = require('web3');

  //const bytecode = a.contracts[':Inbox'].bytecode;
  
  var provider = new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/4e962d53cc894df2a63436f519d1e9d0");
  
  const web3 = new Web3(provider);
  account = await web3.eth.getAccounts();
 
  console.log("account is",accounts)

web3.eth.sign("0x" + message.toString("hex"), account[0],
callback);
}
function signPayment(contractAddress, amount, callback) {
  var message = constructPaymentMessage(contractAddress,amount);
  console.log("message is",message)
  signMessage(message, async (err,signature)=>{
      try {
         
        console.log("sig",signature);
        //
        //Send email
        const output = `
        <p>Registration Detail</p>
          Hi the signature  ${signature} Has been sent to +${email} click this link <a href="http://localhost:4000/verify/signature">http://localhost:4000/verify/signature</a> to close the channel.Amount sent is ${amount} wei and contract address is ${contract}.Thanks
        `;
    
        let transporter = nodemailer.createTransport({
          host: 'smtp.mailtrap.io',
          port: 2525,
          secure: false, // true for 465, false for other ports
          auth: {
            user: 'e36b59e6f3ba11', // generated ethereal user
            pass: '3cea2e1bda5682'  // generated ethereal password
          },
          tls:{
          rejectUnauthorized:false
          }
          });
    
          let mailOptions = {
            from: '"test@testing.io', // sender address
            to:email, // list of receivers
            subject: 'Regisration Detail', // Subject line
            text: 'Hello world?', // plain text body
            html: output // html body
          };
    
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              
              return console.log(error);
            }
            // Show message here to email send and verify
            console.log('Message sent: %s', info.messageId);   
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            
          });

        //

       
      }
      catch(error){
        console.log("siasdsdg",error.message);

      }

     
  })

  
}
// app.use('/newuser',signUp);
// app.use('/user',signIn);
// app.use('/verify',verifyEmail);
// app.use(forgetPassword);

//passport middleware function
// require ('./config/passport')(passport);
// require ('./config/localPassport')(passport);

// Page not found middleware
//  app.use(function(req,res,next){
//    res.render('index/notFound')
//  })

const port = process.env.PORT || 4000;

app.listen(port,function(){
  console.log(`app is listen on ${port}`)
})