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
function setToken(token) {
  // Remove any surrounding quotes from the token before storing
  const cleanToken = token.replace(/^"|"$/g, '');
  localStorage.setItem('jwt_token', cleanToken);
  console.log("Token set:", cleanToken);
}

function getToken() {
  const token = localStorage.getItem('jwt_token');
  console.log("getting token", token);
  return token;
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
    const token = await response.json();

    if (response.ok) {
      isAuthenticated = true;
      setToken(token)
      navigateTo("/")
    } else {
      console.error("API Error:", token.error || "Unknown error");
      alert(token.error || "Failed to sign in");
    }
  } catch (err) {
    console.error("Fetch error:", err);
    alert("Error while signing in");
  }
}

// Show User Data after login
async function showUserData() {
  const token = getToken()
  if (!token) navigateTo('/signin');
  const query =`
     query {
       user {
       firstName
       lastName
       login
       auditRatio
         totalUp
         totalDown
         email
         campus
         transactions(
             where: { type: { _like: "skill_%" } }
             order_by: [{ type: asc }, { amount: desc }]
             distinct_on: type
           ) {
             id
             type
             amount
           }          
     }
   
   transaction(
     where: {
 
          type: { _eq: "xp" } ,
          eventId: { _eq: 41 }
 } 
   ) {
     type
     amount
     path
     createdAt
     eventId
     object {
       type
       name
     }
   }
 }
     `
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
    console.log(data,'-----------------------');
    
    if (response.ok) {
      createTheDashboard(data)
    } else {
      console.error("Error:", data.errors);
    }
  } catch (err) {
    console.log(err);
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

// Home Page
function renderHome(token) {
  app.innerHTML = `
    <header>
        <div class="Logout-button">
          <button onclick="logout()">Logout</button>
        </div>
    </header>
     <span id="username"></span>
    
    <div id="userStats"></div>
    
    <h4>User Xp</h4>
    <div id="user-xp"></div>
    <div>
    <div id="transactionsDiv"></div>
    <div id="xp-progression"></div>
    </div>
  `;
  try {
    showUserData(token)
  }catch(err){
    console.log(err);
    logout();
  }
}

function logout() {
  localStorage.removeItem('jwt_token');
  navigateTo("/singin")
}

function createTheDashboard(userData) {
  document.getElementById('username').textContent = `Hi ${userData.data.user[0].login}! This is Your 01 Dashboard`;

  document.getElementById('userStats').innerHTML = `
      <p>Total Up: ${(userData.data.user[0].totalUp / 1000000).toFixed(2)} MB</p>
      <p>Total Down: ${(userData.data.user[0].totalDown / 1000000).toFixed(2)} MB</p>
      <p>Audit Ratio: <span id="auditRatio">${
          userData.data.user[0].auditRatio % 1 >= 0.999
              ? Math.ceil(userData.data.user[0].auditRatio)
              : Math.floor(userData.data.user[0].auditRatio * 10) / 10
      }</span></p>
  `;

  let acum = userData.data.transaction.reduce((acc, transaction) => acc + transaction.amount, 0);
  acum = Math.ceil(acum / 1000);
  document.getElementById("user-xp").innerHTML = `
      <div class="user-xpara">${acum} KB</div>
  `;
  const xp_progression = document.getElementById('xp-progression');
  if (userData.data.transaction) {
      const xpGraph = createXPGraph(userData.data.transaction);
      xp_progression.appendChild(xpGraph);
  }

  const transactionsDiv = document.getElementById('transactionsDiv');
  if (userData.data.user[0].transactions) {
          const skillsChart = createSkillsChart(userData.data.user[0].transactions);
          transactionsDiv.appendChild(skillsChart);
  }
}

// Add this to your renderContentSec function after the existing code
function createXPGraph(transactions) {
  // Sort transactions by date
  const sortedTransactions = transactions.sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
  );

  // Calculate cumulative XP
  // each time how much xp do you have
  let cumulativeXP = 0;
  const cumulativeTransactions = sortedTransactions.map(transaction => {
      cumulativeXP += transaction.amount;
      return {
          ...transaction,
          cumulativeAmount: cumulativeXP
      };
  });
  

  // Calculate graph dimensions
  const width = 580;
  const height = 300;
  const padding = 20;
  const graphWidth = width - (padding * 2);
  const graphHeight = height - (padding * 2);

  // Create SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `20 -30 680 300`);
  svg.setAttribute("class", "xp-graph");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);

  // Calculate scales using cumulative amounts
  // xscale space between each point
  const xScale = graphWidth / (cumulativeTransactions.length - 1);
  const maxXP = Math.max(...cumulativeTransactions.map(t => t.cumulativeAmount));
  
  const yScale = graphHeight / maxXP;
  

  // Create axes
  // Y-axis
  const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  yAxis.setAttribute("x1", padding);
  yAxis.setAttribute("y1", padding);
  yAxis.setAttribute("x2", padding);
  yAxis.setAttribute("y2", height - padding);
  yAxis.setAttribute("stroke", "#666");
  yAxis.setAttribute("stroke-width", "1");
  svg.appendChild(yAxis);

  // X-axis
  const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "line");
  xAxis.setAttribute("x1", padding);
  xAxis.setAttribute("y1", height - padding);
  xAxis.setAttribute("x2", width - padding);
  xAxis.setAttribute("y2", height - padding);
  xAxis.setAttribute("stroke", "#666");
  xAxis.setAttribute("stroke-width", "1");
  svg.appendChild(xAxis);

  // Create the path data for the line using cumulative amounts
  let pathData = "M ";
  const points = cumulativeTransactions.map((t, i) => ({
      x: padding + (i * xScale),
      y: height - padding - (t.cumulativeAmount * yScale)
  }));
  
  pathData += points.map(p => `${p.x},${p.y}`).join(" L ");    

  // Create and append the line path
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathData);
  path.setAttribute("stroke", "#4CAF50");
  path.setAttribute("stroke-width", "1");
  path.setAttribute("fill", "none");
  svg.appendChild(path);

  // Add dots and tooltips for each point
  points.forEach((point, i) => {
      const transaction = cumulativeTransactions[i]

      const date = new Date(transaction.createdAt);
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
      const currentXPInKB = (transaction.amount / 1000).toFixed(1);
      const totalXPInKB = (transaction.cumulativeAmount / 1000).toFixed(1);

      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", point.x);
      dot.setAttribute("cy", point.y);
      dot.setAttribute("r", "2");
      dot.setAttribute("fill", "#4CAF50");

      const tooltip = document.createElementNS("http://www.w3.org/2000/svg", "title");
      tooltip.textContent = `${transaction.object.name}\nCurrent XP: ${currentXPInKB}KB\nTotal XP: ${totalXPInKB}KB\nDate: ${formattedDate}`;
      dot.appendChild(tooltip);

      dot.addEventListener("mouseover", () => {
          dot.style.cursor = "pointer";
          dot.setAttribute("r", "4");
          dot.setAttribute("fill", "#69F0AE");
      });
      dot.addEventListener("mouseout", () => {
          dot.setAttribute("r", "2");
          dot.setAttribute("fill", "#4CAF50");
      })

      svg.appendChild(dot)
  });

  return svg;
}

// horizontal ghraph 
function createSkillsChart(transactions) { 
  // Process skills data (trim 'skill_' without accumulating)
  const skillsData = transactions.map(curr => ({
      skill: curr.type.replace('skill_', ''), 
      amount: curr.amount
  }));

  const sortedSkills = skillsData
      .sort((b, a) => a.amount - b.amount)

  console.log("sortedSkills",sortedSkills);
  // SVG dimensions
  const width = 650;
  const height = 500;
  const padding = { left: 100, right: 20, top: 20, bottom: 30 };
  const barHeight = 15;
  const gap = 15;
  const scaleFactor = 0.6; // Reduce bar width by 60%

  // Create SVG
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);

  // Create bars and labels
  sortedSkills.forEach((skill, index) => {
      const percentage = skill.amount; 
      const barWidth = ((width - padding.left - padding.right) * percentage / 100) * scaleFactor; // Scale down width
      const yPosition = padding.top + index * (barHeight + gap)

      // Create bar
      const bar = document.createElementNS("http://www.w3.org/2000/svg", "rect")
      bar.setAttribute("x", padding.left)
      bar.setAttribute("y", yPosition)
      bar.setAttribute("width", barWidth)
      bar.setAttribute("height", barHeight)
      bar.setAttribute("fill", "#4CAF50")
      bar.setAttribute("rx", "1")

      // Create skill label
      const skillLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
      skillLabel.setAttribute("x", padding.left -10);
      skillLabel.setAttribute("y", yPosition + barHeight / 2);
      skillLabel.setAttribute("text-anchor", "end");
      skillLabel.setAttribute("alignment-baseline", "middle");
      skillLabel.setAttribute("fill", "#666");
      skillLabel.setAttribute("font-size", "14");
      skillLabel.textContent = skill.skill;

      // Create percentage text
      const percentageText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      percentageText.setAttribute("x", padding.left + barWidth + 5);
      percentageText.setAttribute("y", yPosition + barHeight / 2);
      percentageText.setAttribute("alignment-baseline", "middle");
      percentageText.setAttribute("fill", "#4CAF50");
      percentageText.setAttribute("font-size", "14");
      percentageText.textContent = `${percentage.toFixed(1)}%`;

      // Append elements
      svg.appendChild(bar);
      svg.appendChild(skillLabel);
      svg.appendChild(percentageText);
  });

  return svg;
}