import React, {useState, useEffect} from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../FirebaseConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import { isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink } from 'firebase/auth';

export const Login = () => {

  const [user] = useAuthState(auth);

  const navigate = useNavigate();
  const location = useLocation();
  const {search} = location;

  const [email, setEmail] = useState('');

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [infoMsg, setInfoMsg] = useState('');

  const [initialLoading, setInitialLoading] = useState(false);
  const [initialError, setInitialError] = useState('');

  useEffect(()=>{
    //async function for fetchIsSignInWithEmailLink
    const fetchIsSignInWithEmailLink = async () => {
      const res = await fetch("http://localhost:4000/isSignInWithEmailLink", {
        method: "POST",
        headers:{
          "Content-Type": "application/json",
      },
       
        body: JSON.stringify({
          "href": window.location.href,}
      )
    })
    const result = await res.json();
   
  console.log("fetchIsSignInWithEmailLink",result);
  return result;
    }
    //async function for fetchSignInWithEmailLink
    const fetchSignInWithEmailLink = async () => {
      const res = await fetch("http://localhost:4000/signInWithEmailLink", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
      },
        
        body: JSON.stringify({
          "email": localStorage.getItem('email'),
          "href": window.location.href,}
      ) 
    }
  ) 
  const result = await res.json();
  
  console.log("fetchSignInWithEmailLink",result);
  return result;
    }
    //async function for generateToken
    const generateToken = async () => {
      const res = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
      },
        
        body: JSON.stringify({
          "email": localStorage.getItem('email'),
        }
      ) 
    }
  ) 
  const result = await res.json();
  
  console.log("generateToken",result);
  localStorage.setItem('accessToken', result.accessToken);
  localStorage.setItem('refreshToken', result.refreshToken);
  return result;
    }
    if(user){
      // user is already signed in
      navigate('/');
    }
    else{
      fetchIsSignInWithEmailLink()
      .then((result)=>{
        console.log("fetchIsSignInWithEmailLink", result);
        if (result.isSignInWithEmailLink){
        let email = localStorage.getItem('email');
        if(!email){
          email = window.prompt('Please provide your email');
        }
        // after that we will complete the login process
        setInitialLoading(true);
        fetchSignInWithEmailLink()
        .then((result)=>{
          // we can get the user from result.user but no need in this case
          // apply jwt token to user
          console.log(result);
          generateToken()
          .then(()=>{
            localStorage.removeItem('email');
            setInitialLoading(false);
            setInitialError('');
            navigate('/');
          })
          
        }
     
    ).catch((err)=>{
          
          setInitialLoading(false);
          if (window.location.href !== "http://localhost:3000/login"){
          setInitialError(err.message);
          }
          navigate('/login');
        })
      } 
      else{
        console.log('enter email and sign in');
      }
    
    })
      .catch((err)=>{
        console.log('enter email and sign in');
      })
      // user is not signed in but the link is valid
      // if(isSignInWithEmailLink(auth, window.location.href)){
      //   // now in case user clicks the email link on a different device, we will ask for email confirmation
      //   let email = localStorage.getItem('email');
      //   if(!email){
      //     email = window.prompt('Please provide your email');
      //   }
      //   // after that we will complete the login process
      //   setInitialLoading(true);
      //   signInWithEmailLink(auth, localStorage.getItem('email'), window.location.href)
      //   .then((result)=>{
      //     // we can get the user from result.user but no need in this case
      //     console.log(result.user);
      //     localStorage.removeItem('email');
      //     setInitialLoading(false);
      //     setInitialError('');
      //     navigate('/');
      //   }).catch((err)=>{
      //     setInitialLoading(false);
      //     setInitialError(err.message);
      //     navigate('/login');
      //   })
      // }
      // else{
      //   console.log('enter email and sign in');
      // }
    }
  },[user, search, navigate]);

  const handleLogin=(e)=>{
    e.preventDefault();
    let headers = {
      "Content-Type": "application/json",
  }
    setLoginLoading(true);
    fetch("http://localhost:4000/emailLink", {
      method: "POST",
      headers: headers,
      //別忘了把主體参數轉成字串，否則資料會變成[object Object]，它無法被成功儲存在後台
      body: JSON.stringify({
        "email": email,}
    )
  }).then(()=>{
      localStorage.setItem('email', email);
      setLoginLoading(false);
      setLoginError('');
      setInfoMsg('We have sent you an email with a link to sign in');
    }).catch(err=>{
      setLoginLoading(false);
      setLoginError(err.message);
    })
  }

  return (
    <div className='box'>
      {initialLoading?(
        <div>Loading...</div>
      ):(
        <>
          {initialError!==''?(
            <div className='error-msg'>{initialError}</div>
          ):(
            <>
              {/* We are checking user because for a split second, we will not have user */}
              {user?(
                // so instead of seeing form, I am using this please wait msg
                <div>Please wait...</div>
              ):(
                // for a split second we will see this form
                <form className='form-group custom-form' onSubmit={handleLogin}>
                  <label>Email</label>
                  <input type={'email'} required placeholder='Enter Email'
                  className='form-control'
                  value={email||''} onChange={(e)=>setEmail(e.target.value)}/>
                  <button type='submit' className='btn btn-success btn-md'>
                    {loginLoading?(
                      <span>Logging you in</span>
                    ):(
                      <span>Login</span>
                    )}
                  </button>
                  {/* show login error msg */}
                  {loginError!==''&&(
                    <div className='error-msg'>{loginError}</div>
                  )}

                  {/* show info msg */}
                  {infoMsg!==''&&(
                    <div className='info-msg'>{infoMsg}</div>
                  )}
                </form>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
