/*
async function signin() {
    try {
        const username = "usr";
        const password = "password";
        const encodedCredentials = btoa(`${username}:${password}`);
        const response = await fetch("https://zone01oujda.ma/api/auth/signin", {
            method: "POST",
        body: {
                "Authorization": `Basic ${encodedCredentials}`,
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Success:", data);
            return data; 
        } else {
           
            console.error("API Error:", data.error || "Unknown error");
            throw new Error(data.error || "Failed to sign in")
        }
    } catch (err) {
        console.error("Fetch error:", err);
        throw err; 
    }
}

signin()
*/
var body = document.querySelector('body')


async function showuserdata() {
  const query = `
    query {
        user {
            login
        }
        transaction {
        amount
        }
        progress {
        grade
        }
        object {
        
        }
    }`;
  const token = "jwt token"
  try {
    const response = await fetch('https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql', {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(data["data"].user[0]);      
     let login = document.createElement('h1')
      login.textContent = "Hi "+data["data"].user[0]["login"]


      body.append(login)
    } else {
      console.error("Error:", data.errors);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

await showuserdata();