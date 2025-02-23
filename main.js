const body = document.querySelector('body');
const app = document.getElementById('app');

// Global variable to track authentication status
let isAuthenticated = false;  // Initially, the user is not authenticated

// Define available routes
const routes = [
  {
    path: '/',
    render: renderHome,
    protected: true, // Home is a protected route
  },
  {
    path: '/signin',
    render: renderSignin,
    protected: false, // Sign In is not protected
  },
  {
    path: '/404',
    render: render404,
    protected: false, // 404 page is not protected
  },
];

// Function to navigate to a route
function navigateTo(path) {
  history.pushState(null, '', path);
  renderPage(path);
}

// Function to render a page based on the current path
function renderPage(path) {
  // Check if the route is protected and if the user is authenticated
  const route = routes.find(route => route.path === path);

  if (route) {
    if (route.protected && !isAuthenticated) {
      // If the route is protected and the user is not authenticated, redirect to Sign In
      navigateTo('/signin');
    } else {
      // Otherwise, render the corresponding route
      route.render();
    }
  } else {
    // If path does not exist, render 404 page
    render404();
  }
}

// Home Page
function renderHome(token) {
  app.innerHTML = `
    <header>
        <div class="Logout-button">
          <button onclick="navigateTo('/signin')">Logout</button>
        </div>
    </header>
    <h1> Hi Hamza! This Your 01 Dashboard </h1>
    <section>
        <svg class="1"></svg>
        <svg class="2"></svg>
    </section>
  `;
  showUserData(token)
}

// Sign In Page
function renderSignin() {
  app.innerHTML = `
    <div class="container">
            
            <div class="Paragraph">
                <h1>Talents Dashboard</h1>
                <h3>Lorem ipsum dolor sit amet consectetur adipisicing elit. Beatae cumque nulla recusandae eveniet quae impedit placeat consectetur autem alias? Dolore, accusantium quibusdam at atque libero voluptatum laboriosam numquam eum consequatur?</h3>
            </div>
            
            <div class="data-sender">
                <h1>LOGIN</h1>
                <div class="input-box">
                    <label for="Email Or User">Email Or Username:</label>
                    <input type="text" placeholder="user or email" required id="username">
                    <i class='bx bxs-user'></i>
                </div>

                <div class="input-box">
                    <label for="Password">Password:</label>
                    <input type="password" placeholder="Password" required id="password">
                    <i class='bx bxs-lock-alt'></i>
                </div>
                
                <button id="login-btn">Login</button>
            </div>
            
    </div>
  `;
  document.getElementById("login-btn").addEventListener("click", signin);
}

// Sign In function
async function signin() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  try {
    const encodedCredentials = btoa(`${username}:${password}`);
    const response = await fetch("https://learn.zone01oujda.ma/api/auth/signin", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${encodedCredentials}`,
        "Content-Type": "application/json"
      }
    });
    const data = await response.json();

    if (response.ok) {
      isAuthenticated = true;
      renderHome(data)
    } else {
      console.error("API Error:", data.error || "Unknown error");
      alert(data.error || "Failed to sign in");
    }
  } catch (err) {
    console.error("Fetch error:", err);
    alert("Error while signing in");
  }
}

// Show User Data after login
async function showUserData(token) {
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
            user {
                login
                firstName
                lastName
                campus
                auditRatio
                totalUp
                totalDown
                xpTotal: transactions_aggregate(where: {type: {_eq: "xp"}, eventId: {_eq: 56}}) {
                  aggregate {
                    sum {
                      amount
                    }
                  }
                }
                events(where:{eventId:{_eq:56}}) {
                  level
                }
                xp: transactions(order_by: {createdAt: asc}
                  where: {type: {_eq: "xp"}, eventId: {_eq: 56}}) {
                    createdAt
                    amount
                    path
                }
                finished_projects: groups(where:{group:{status:{_eq:finished}}}) {
                    group {
                    path
                    status
                  }
                }
                current_projects: groups(where:{group:{status:{_eq:working}}}) {
                    group {
                    path
                    status
                    members {
                      userLogin
                    }
                  }
                }
                setup_project: groups(where:{group:{status:{_eq:setup}}}) {
                    group {
                    path
                    status
                    members {
                      userLogin
                    }
                  }
                }
                skills: transactions(
                    order_by: {type: asc, amount: desc}
                    distinct_on: [type]
                    where: {eventId: {_eq: 56}, _and: {type: {_like: "skill_%"}}}
                ) {
                    type
                    amount
                }
            }
        }
  }`;

  try {
    const response = await fetch('https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: query })
    });

    const data = await response.json();
    if (response.ok) {
      console.log(data);

      console.log("good moring");
    } else {
      console.error("Error:", data.errors);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

// 404 Page
function render404() {
  app.innerHTML = `
    <div class="container">
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <div class="navigation">
        <button onclick="navigateTo('/')">Go to Home</button>
      </div>
    </div>
  `;
}

// Handle back and forward browser navigation
window.onpopstate = function () {
  renderPage(window.location.pathname);
};

// Initial page load
renderPage('/singin');