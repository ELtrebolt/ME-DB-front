import{j as e,r as c,t,P as g,a as b}from"./index-3F-IvF8E.js";const u=()=>e.jsxs("footer",{className:"py-4 mt-auto",children:[e.jsxs("div",{className:"container text-center",children:[e.jsxs("div",{className:"d-flex justify-content-center gap-4 mb-2",children:[e.jsx("a",{href:"/privacy",className:"text-white-50 text-decoration-none small hover-white",children:"Privacy Policy"}),e.jsx("a",{href:"/terms",className:"text-white-50 text-decoration-none small hover-white",children:"Terms of Service"})]}),e.jsxs("div",{className:"text-white-50 small",children:["© ",new Date().getFullYear()," ME-DB"]})]}),e.jsx("style",{children:`
          .hover-white:hover {
            color: #fff !important;
            text-decoration: underline !important;
          }
        `})]}),y="https://me-db.app/collection.mp4",f="https://me-db.app/todo.mp4",v=()=>{c.useEffect(()=>{const o=document.createElement("link");return o.href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap",o.rel="stylesheet",document.head.appendChild(o),()=>{document.head.removeChild(o)}},[])},j=()=>{const o=c.useRef(null),[r,i]=c.useState(!1);return c.useEffect(()=>{const n=o.current,a=new IntersectionObserver(([s])=>{s.isIntersecting&&(i(!0),a.unobserve(s.target))},{threshold:.1});return n&&a.observe(n),()=>{n&&a.unobserve(n)}},[]),{ref:o,isVisible:r}},l=({children:o,delay:r=0,className:i="",style:n={}})=>{const{ref:a,isVisible:s}=j();return e.jsx("div",{ref:a,className:i,style:{...n,opacity:s?1:0,transform:s?"translateY(0)":"translateY(30px)",transition:`opacity 500ms ease ${r}ms, transform 500ms ease ${r}ms`},children:o})},h=()=>{window.open(b.SERVER_URL+"/auth/google","_self")},w=()=>{const[o,r]=c.useState(!1);c.useEffect(()=>{const n=()=>{r(window.scrollY>50)};return window.addEventListener("scroll",n),()=>window.removeEventListener("scroll",n)},[]);const i=n=>{const a=document.getElementById(n);a&&a.scrollIntoView({behavior:"smooth"})};return e.jsxs("nav",{className:`navbar navbar-expand-md fixed-top transition-all duration-300 ${o?"navbar-scrolled":""}`,style:{transition:"all 0.3s ease",padding:o?"0.5rem 1rem":"1.5rem 1rem",backgroundColor:o?"#ffffff":"transparent",boxShadow:o?"0 1px 3px rgba(0,0,0,0.1)":"none"},children:[e.jsxs("div",{className:"container",children:[e.jsxs("a",{className:"navbar-brand fw-bold d-flex align-items-center gap-2",href:"#hero",onClick:n=>{n.preventDefault(),i("hero")},style:{fontSize:"1.5rem",color:o?t.components.introPage.navbar.textColorScrolled:t.components.introPage.navbar.textColor},children:[e.jsx("img",{src:"/favicon.ico",alt:"ME-DB",style:{width:"32px",height:"32px"}}),"ME-DB"]}),e.jsx("button",{onClick:h,className:`btn ${o?"btn-dark":"btn-light"} rounded-pill px-3 fw-bold d-md-none`,style:{fontSize:"0.85rem"},children:"Sign In"}),e.jsx("button",{className:"navbar-toggler",type:"button","data-bs-toggle":"collapse","data-bs-target":"#introNavbar",children:e.jsx("span",{className:"navbar-toggler-icon",style:{filter:o?"none":"invert(1)"}})}),e.jsx("div",{className:"collapse navbar-collapse justify-content-center",id:"introNavbar",children:e.jsx("ul",{className:"navbar-nav gap-md-5",style:{background:"transparent"},children:["About","Features","Why","FAQ"].map(n=>e.jsx("li",{className:"nav-item",children:e.jsx("a",{href:`#${n.toLowerCase().replace(" ","-")}`,onClick:a=>{a.preventDefault(),i(n.toLowerCase().replace(" ","-"))},className:"nav-link fw-medium transition-colors hover-opacity",style:{fontSize:"0.95rem",cursor:"pointer",color:o?t.components.introPage.navbar.textColorScrolled:t.components.introPage.navbar.textColor},children:n})},n))})}),e.jsx("div",{className:"d-none d-md-block",children:e.jsx("button",{onClick:h,className:`btn ${o?"btn-dark":"btn-light"} rounded-pill px-4 fw-bold`,style:{fontSize:"0.9rem"},children:"Sign In"})})]}),e.jsx("style",{children:`
          .hover-primary:hover { color: #0d6efd !important; }
          .hover-opacity:hover { opacity: 0.8; }
          .transition-colors { transition: color 0.2s ease; }
          
          /* Desktop navbar - transparent inner elements, center nav above hero */
          @media (min-width: 768px) {
            .navbar .container {
              position: relative;
              display: flex;
              flex-wrap: wrap;
              justify-content: space-between;
              align-items: center;
            }
            #introNavbar {
              position: absolute;
              left: 50%;
              transform: translateX(-50%);
            }
            #introNavbar,
            #introNavbar *,
            .navbar-collapse,
            .navbar-nav,
            .nav-item,
            .nav-link {
              background-color: transparent !important;
              background: none !important;
              background-image: none !important;
              border: none !important;
              box-shadow: none !important;
              outline: none !important;
              -webkit-box-shadow: none !important;
            }
          }
          
          /* Mobile navbar: horizontal row with navy bg (same as hero) */
          @media (max-width: 767.98px) {
            #introNavbar {
              position: absolute;
              top: 100%;
              left: 0;
              right: 0;
              background-color: #1D2144 !important;
              background: #1D2144 !important;
              padding: 0.75rem 1rem;
              border-top: 1px solid rgba(255, 255, 255, 0.2);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
              z-index: 1030;
            }
            #introNavbar .navbar-nav {
              flex-direction: row !important;
              justify-content: center;
              flex-wrap: nowrap;
              gap: 0.5rem !important;
            }
            #introNavbar .nav-item {
              flex: 0 0 auto;
            }
            #introNavbar .nav-link {
              padding: 0.75rem 1rem !important;
              font-size: 0.9rem !important;
            }
            /* Mobile logo styling */
            .navbar-brand {
              font-size: 1.2rem !important;
            }
            .navbar-brand img {
              width: 24px !important;
              height: 24px !important;
            }
          }
          /* When navbar is scrolled (white background) - mobile only */
          @media (max-width: 767.98px) {
            .navbar-scrolled #introNavbar {
              background-color: #f8f9fa !important;
              border-top: 1px solid #e5e7eb;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
          }
        `})]})},m=({id:o,className:r,children:i,style:n})=>e.jsx("section",{id:o,className:r,style:{paddingTop:"100px",paddingBottom:"100px",...n},children:i}),N=[{icon:"🍥",label:"Anime",path:"/demo/anime/collection"},{icon:"📺",label:"TV Shows",path:"/demo/tv/collection"},{icon:"🎥",label:"Movies",path:"/demo/movies/collection"},{icon:"🕹️",label:"Video Games",path:"/demo/games/collection"}],d=[[{icon:"✈️",label:"Travel"},{icon:"📚",label:"Books"},{icon:"🎨",label:"Artists"},{icon:"🎵",label:"Concerts"}],[{icon:"🍽️",label:"Cuisines"},{icon:"🍿",label:"Snacks"},{icon:"🍷",label:"Alcohol"},{icon:"🎁",label:"Gifts"}]],k=()=>{const[o,r]=c.useState(0),i=c.useRef(null),n=a=>{r(s=>(s+a+d.length)%d.length),i.current&&clearInterval(i.current),i.current=setInterval(()=>{r(s=>(s+1)%d.length)},4e3)};return c.useEffect(()=>(i.current=setInterval(()=>{r(a=>(a+1)%d.length)},4e3),()=>{i.current&&clearInterval(i.current)}),[]),e.jsx(m,{id:"about",style:{backgroundColor:t.components.introPage.aboutBg},children:e.jsxs("div",{className:"container",children:[e.jsx(l,{children:e.jsxs("div",{className:"text-center mb-5",children:[e.jsx("h2",{className:"display-5 fw-bold mb-4",style:{color:t.components.introPage.text.primary},children:"How It Works"}),e.jsx("p",{className:"fs-4 d-none d-md-block",style:{color:t.components.introPage.text.secondary},children:"(1) Create your media    (2) Drag and drop into tiers    (3) Search and filter!"}),e.jsxs("div",{className:"d-md-none fs-5",style:{color:t.components.introPage.text.secondary},children:[e.jsx("p",{className:"mb-2",children:"(1) Create your media"}),e.jsx("p",{className:"mb-2",children:"(2) Drag and drop into tiers"}),e.jsx("p",{className:"mb-0",children:"(3) Search and filter!"})]})]})}),e.jsxs(l,{delay:100,children:[e.jsx("p",{className:"text-center fs-5 fw-semibold mb-3",style:{color:t.components.introPage.text.secondary},children:"Standard Types"}),e.jsx("div",{className:"row justify-content-center g-4 mt-2",children:N.map((a,s)=>e.jsxs("div",{className:"col-6 col-md-3 text-center",children:[e.jsx("div",{className:"display-1 mb-3",children:a.icon}),e.jsx("p",{className:"fs-5 fw-medium mb-3",style:{color:t.components.introPage.text.primary},children:a.label}),e.jsx("a",{href:a.path,className:"btn btn-outline-light rounded-pill px-4",style:{fontSize:"0.9rem",textDecoration:"none"},children:"Try Demo"})]},s))})]}),e.jsxs(l,{delay:200,children:[e.jsx("p",{className:"text-center fs-5 fw-semibold mb-3 mt-5",style:{color:t.components.introPage.text.secondary},children:"Custom Types"}),e.jsxs("div",{className:"about-custom-carousel position-relative overflow-hidden d-flex align-items-center",children:[e.jsx("button",{type:"button",className:"about-carousel-btn position-absolute start-0 top-50 translate-middle-y border-0 rounded-circle d-flex align-items-center justify-content-center",style:{background:"rgba(255,255,255,0.15)",color:t.components.introPage.text.primary,width:40,height:40,zIndex:2},onClick:()=>n(-1),"aria-label":"Previous custom types",children:"←"}),e.jsxs("div",{className:"position-relative flex-grow-1",style:{minWidth:0},children:[d.map((a,s)=>e.jsx("div",{className:"row justify-content-center g-4 mt-2 position-absolute w-100 start-0 top-0",style:{opacity:o===s?1:0,visibility:o===s?"visible":"hidden",transform:`translateX(${o===s?0:s<o?30:-30}px)`,transition:"opacity 500ms ease, transform 500ms ease, visibility 500ms ease",pointerEvents:o===s?"auto":"none",zIndex:o===s?1:0},children:a.map((p,x)=>e.jsxs("div",{className:"col-6 col-md-3 text-center about-custom-item",children:[e.jsx("div",{className:"about-custom-emoji mb-2",children:p.icon}),e.jsx("p",{className:"fs-5 fw-medium mb-0 text-nowrap about-custom-label",children:p.label})]},x))},s)),e.jsx("div",{className:"row justify-content-center g-4 mt-2 about-custom-spacer","aria-hidden":!0,children:d[0].map((a,s)=>e.jsxs("div",{className:"col-6 col-md-3 text-center",children:[e.jsx("div",{className:"about-custom-emoji mb-2",children:a.icon}),e.jsx("p",{className:"fs-5 fw-medium mb-0 text-nowrap about-custom-label",children:a.label})]},s))})]}),e.jsx("button",{type:"button",className:"about-carousel-btn position-absolute end-0 top-50 translate-middle-y border-0 rounded-circle d-flex align-items-center justify-content-center",style:{background:"rgba(255,255,255,0.15)",color:t.components.introPage.text.primary,width:40,height:40,zIndex:2},onClick:()=>n(1),"aria-label":"Next custom types",children:"→"})]})]})]})})},C=()=>(v(),c.useEffect(()=>{const o=window.location.hash.slice(1);if(o){const i=setTimeout(()=>{const n=document.getElementById(o);n&&n.scrollIntoView({behavior:"smooth",block:"start"})},100);return()=>clearTimeout(i)}},[]),e.jsxs("div",{style:{backgroundColor:t.components.introPage.heroBg,fontFamily:"'Poppins', sans-serif"},children:[e.jsx(g,{title:"ME-DB – Track Anime, Movies, TV & Games",noSuffix:!0,description:"ME-DB – track and organize your anime, movies, TV shows, and games in one place."}),e.jsx(w,{}),e.jsxs("section",{id:"hero",className:"d-flex flex-column position-relative",style:{minHeight:"100vh",backgroundColor:t.components.introPage.heroBg,paddingTop:"80px"},children:[e.jsx("div",{className:"container text-center flex-grow-1 d-flex align-items-center justify-content-center",style:{color:t.components.introPage.text.primary},children:e.jsx("div",{className:"row justify-content-center w-100 mx-0",children:e.jsxs("div",{className:"col-lg-8 px-3",children:[e.jsx(l,{children:e.jsxs("h1",{style:{color:t.components.introPage.text.primary,marginBottom:"2rem"},children:[e.jsx("span",{className:"fw-bold d-block mb-2 display-5",style:{color:"#e2e8f0"},children:"Build your own"}),e.jsx("span",{className:"fw-bold display-5",style:{color:t.colors.primary},children:"Media Entertainment Database"})]})}),e.jsx(l,{delay:150,children:e.jsx("div",{className:"d-flex justify-content-center gap-3 mb-5",children:e.jsxs("div",{className:"google-btn",onClick:h,children:[e.jsx("div",{className:"google-icon-wrapper",children:e.jsx("img",{className:"google-icon",alt:"Google logo",src:"https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"})}),e.jsx("span",{className:"btn-text",children:"Sign in with Google"})]})})}),e.jsx(l,{delay:300,children:e.jsxs("div",{className:"mb-4",style:{color:t.components.introPage.text.secondary},children:[e.jsxs("p",{className:"lead fs-5 mb-3",style:{lineHeight:"1.6"},children:[e.jsxs("span",{className:"d-none d-md-inline",children:[e.jsx("span",{className:"fw-bold",children:"Tier lists"})," ",e.jsx("span",{className:"fw-normal",children:"for your"})," ",e.jsx("span",{className:"fw-bold",children:"Collection"})," ",e.jsx("span",{className:"fw-normal",children:"and"})," ",e.jsx("span",{className:"fw-bold",children:"To-Do List. All in one app."})]}),e.jsxs("span",{className:"d-md-none",children:[e.jsx("span",{className:"fw-bold",children:"Tier lists"})," ",e.jsx("span",{className:"fw-normal",children:"for your"}),e.jsx("br",{}),e.jsx("span",{className:"fw-bold",children:"Collection"})," ",e.jsx("span",{className:"fw-normal",children:"and"})," ",e.jsx("span",{className:"fw-bold",children:"To-Do List."}),e.jsx("br",{}),e.jsx("span",{className:"fw-bold",children:"All in one app."})]})]}),e.jsx("p",{className:"fs-5 mb-0",style:{color:t.components.introPage.text.muted},children:"Built for anime, tv shows, movies, video games, and more!"})]})})]})})}),e.jsx("div",{style:{marginTop:"auto"},children:e.jsx(l,{delay:450,children:e.jsxs("div",{className:"text-center pb-3 small",style:{color:t.components.introPage.text.accent},children:[e.jsx("div",{children:"SCROLL TO EXPLORE"}),e.jsx("div",{className:"mt-2",children:"↓"})]})})})]}),e.jsx(k,{}),e.jsx(m,{id:"features",style:{backgroundColor:t.components.introPage.lightBg},children:e.jsxs("div",{className:"container py-5",children:[e.jsx(l,{children:e.jsxs("div",{className:"text-center mb-5",children:[e.jsx("h2",{className:"display-5 fw-bold mb-3",style:{color:t.components.introPage.textLight.primary},children:"Everything you need"}),e.jsx("p",{className:"fs-5",style:{color:t.components.introPage.textLight.secondary},children:"Simple, powerful tools to manage your entertainment life."})]})}),e.jsx("div",{className:"row g-4 pt-4 justify-content-center",children:[{title:"Tier Lists",icon:"📊",desc:"Visualize your tastes instantly from top to bottom with grouped grading levels."},{title:"Collection Tracking",icon:"📚",desc:"Keep a comprehensive history of everything you have done, watched, or played."},{title:"To-Do Lists",icon:"✅",desc:"Never forget a recommendation again. Manage your backlog with ease."},{title:"Multi-Category",icon:"🎮",desc:"Built for ranking Anime, TV Shows, Movies, and Games out of the box."},{title:"Custom Types",icon:"✨",desc:"Create your own categories for Food, Travel, Manga, Podcasts, or anything else."},{title:"Statistics",icon:"📈",desc:"Get insights into your habits and ratings distribution."}].map((o,r)=>e.jsx(l,{delay:r*100,className:"col-md-4",children:e.jsx("div",{className:"card h-100 border-0 hover-lift transition-all",style:{backgroundColor:t.components.introPage.cardLight.background,border:t.components.introPage.cardLight.border,boxShadow:t.components.introPage.cardLight.shadow},children:e.jsxs("div",{className:"card-body p-4 text-center",children:[e.jsx("div",{className:"display-4 mb-3",children:o.icon}),e.jsx("h3",{className:"h5 fw-bold mb-3",style:{color:t.components.introPage.textLight.primary},children:o.title}),e.jsx("p",{className:"mb-0",style:{color:t.components.introPage.textLight.secondary},children:o.desc})]})})},r))})]})}),e.jsx(m,{id:"why",style:{backgroundColor:t.components.introPage.darkBg},children:e.jsxs("div",{className:"container py-5",children:[e.jsxs("div",{className:"row align-items-center mb-5 pb-5",children:[e.jsx(l,{className:"col-lg-6 order-lg-2",delay:150,children:e.jsx("div",{className:"rounded-3 overflow-hidden",style:{backgroundColor:t.components.introPage.cardDark.background,border:t.components.introPage.cardDark.border},children:e.jsx("video",{src:y,className:"w-100",style:{display:"block"},autoPlay:!0,muted:!0,loop:!0,playsInline:!0,preload:"metadata","aria-label":"Collection / tier list view"})})}),e.jsxs(l,{className:"col-lg-6 order-lg-1",children:[e.jsx("h2",{className:"display-6 fw-bold mb-4",style:{color:t.components.introPage.text.primary},children:"For the Completionist"}),e.jsx("p",{className:"lead mb-4",style:{color:t.components.introPage.text.secondary},children:"You finish a game or a series, and you want to record it. Not just that you did it, but how good it was. ME-DB gives you a permanent record of your entertainment journey."}),e.jsxs("ul",{className:"list-unstyled",children:[e.jsxs("li",{className:"mb-3 d-flex align-items-start",style:{color:t.components.introPage.text.secondary},children:[e.jsx("span",{className:"me-3 flex-shrink-0",style:{fontSize:"1.25rem"},title:"Favorites & ratings",children:"⭐"}),e.jsx("span",{children:"Remember your Favorites & Least Favorites, your Top 10 & Bottom 10, your High 5 & Low 5, and your Most Memorable & Most Utterly Regretted"})]}),e.jsxs("li",{className:"mb-3 d-flex align-items-start",style:{color:t.components.introPage.text.secondary},children:[e.jsx("span",{className:"me-3 flex-shrink-0",style:{fontSize:"1.25rem"},title:"Have the answer",children:"💬"}),e.jsx("span",{children:`When someone asks "How would you rate this?" - you'll have the answer`})]}),e.jsxs("li",{className:"mb-3 d-flex align-items-start",style:{color:t.components.introPage.text.secondary},children:[e.jsx("span",{className:"me-3 flex-shrink-0",style:{fontSize:"1.25rem"},title:"Remember & revisit",children:"📚"}),e.jsx("span",{children:`If you ever wonder "What thing should I do/get again?" - you'll probably have the answer already, but in case you wanted to remember it, welcome to ME-DB!`})]})]})]})]}),e.jsxs("div",{className:"row align-items-center",children:[e.jsx(l,{className:"col-lg-6",children:e.jsx("div",{className:"rounded-3 overflow-hidden",style:{backgroundColor:t.components.introPage.cardDark.background,border:t.components.introPage.cardDark.border},children:e.jsx("video",{src:f,className:"w-100",style:{display:"block"},autoPlay:!0,muted:!0,loop:!0,playsInline:!0,preload:"metadata","aria-label":"To-Do list view"})})}),e.jsxs(l,{className:"col-lg-6",delay:150,children:[e.jsx("h2",{className:"display-6 fw-bold mb-4",style:{color:t.components.introPage.text.primary},children:"For the Planner"}),e.jsx("p",{className:"lead mb-4",style:{color:t.components.introPage.text.secondary},children:'"We should watch that!" ...and then you forget. Add it to your To-Do list immediately. Filter by genre, priority, or platform when you are ready to start something new.'}),e.jsxs("ul",{className:"list-unstyled",children:[e.jsxs("li",{className:"mb-3 d-flex align-items-start",style:{color:t.components.introPage.text.secondary},children:[e.jsx("span",{className:"me-3 flex-shrink-0",style:{fontSize:"1.25rem"},title:"Lists",children:"📋"}),e.jsx("span",{children:"Remember your Bucket List, Recommendations List, Wish List, List Of All Your Greatest Hopes & Dreams, and List Of Things You'd Never Ever Dare Try"})]}),e.jsxs("li",{className:"mb-3 d-flex align-items-start",style:{color:t.components.introPage.text.secondary},children:[e.jsx("span",{className:"me-3 flex-shrink-0",style:{fontSize:"1.25rem"},title:"Suggest next",children:"💡"}),e.jsx("span",{children:`When someone asks "What should we try next?" - you'll have the answer`})]}),e.jsxs("li",{className:"mb-3 d-flex align-items-start",style:{color:t.components.introPage.text.secondary},children:[e.jsx("span",{className:"me-3 flex-shrink-0",style:{fontSize:"1.25rem"},title:"What to try next",children:"🎯"}),e.jsx("span",{children:`If you ever wonder "What new thing should I do/get next?" - you'll probably have the answer already, but in case you wanted to remember it, welcome to ME-DB!`})]})]})]})]})]})}),e.jsx(m,{id:"faq",style:{backgroundColor:t.components.introPage.lightBg},children:e.jsxs("div",{className:"container py-5",children:[e.jsx(l,{children:e.jsx("div",{className:"text-center mb-5",children:e.jsx("h2",{className:"fw-bold",style:{color:t.components.introPage.textLight.primary},children:"Frequently Asked Questions"})})}),e.jsx("div",{className:"row justify-content-center",children:e.jsx(l,{className:"col-lg-8",delay:150,children:e.jsx("div",{className:"accordion accordion-flush rounded shadow-sm",id:"faqAccordion",style:{backgroundColor:t.components.introPage.accordionLight.background,overflow:"hidden"},children:[{q:"Is ME-DB free?",a:"Yes, ME-DB is completely free to use for all features!"},{q:"Can I import my data?",a:"No, but please reach out if you have a request! Currently you must add items manually."},{q:"Is there a mobile app?",a:"No, ME-DB is a web-only app. You can add it to your home screen on iOS by following this guide."},{q:"Is my data private?",a:"Your data is private by default. You can choose to make your profile and individual lists public if you wish."}].map((o,r)=>e.jsxs("div",{className:"accordion-item",style:{backgroundColor:t.components.introPage.accordionLight.itemBackground,borderColor:t.components.introPage.accordionLight.border},children:[e.jsx("h2",{className:"accordion-header",children:e.jsx("button",{className:"accordion-button collapsed fw-bold",type:"button","data-bs-toggle":"collapse","data-bs-target":`#faq${r}`,style:{backgroundColor:t.components.introPage.accordionLight.itemBackground,color:t.components.introPage.accordionLight.textColor},children:o.q})}),e.jsx("div",{id:`faq${r}`,className:"accordion-collapse collapse","data-bs-parent":"#faqAccordion",children:e.jsx("div",{className:"accordion-body",style:{color:t.components.introPage.accordionLight.bodyColor},children:o.a})})]},r))})})})]})}),e.jsx("div",{style:{backgroundColor:t.colors.background.dark},children:e.jsx(u,{})}),e.jsx("style",{children:`
          .hover-lift:hover {
            transform: translateY(-5px);
          }
          .transition-all {
            transition: all 0.3s ease;
          }
          
          /* Hero section centering */
          #hero .container {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          #hero .row {
            margin-left: 0;
            margin-right: 0;
          }
          
          /* About section centering */
          #about .container {
            text-align: center;
          }
          #about .row {
            margin-left: auto;
            margin-right: auto;
          }
          /* Custom Types carousel: spacer reserves height so section expands to fit */
          .about-custom-carousel {
            min-height: 0;
            padding-left: 48px;
            padding-right: 48px;
          }
          .about-carousel-btn:hover {
            background: rgba(255,255,255,0.25) !important;
          }
          @media (max-width: 767.98px) {
            .about-custom-carousel {
              padding-left: 40px;
              padding-right: 40px;
            }
          }
          .about-custom-spacer {
            visibility: hidden;
            pointer-events: none;
          }
          .about-custom-emoji {
            font-size: 3rem;
            line-height: 1.2;
            overflow: visible;
          }
          @media (min-width: 768px) {
            .about-custom-emoji {
              font-size: 5rem;
            }
          }
          .about-custom-label {
            color: #e2e8f0 !important;
          }
          #about .about-custom-item {
            flex-shrink: 0;
          }
          #about .about-custom-emoji {
            flex-shrink: 0;
          }
          
          /* Features section centering */
          #features .container {
            text-align: center;
          }
          #features .row {
            margin-left: auto;
            margin-right: auto;
          }
          
          /* Why section - left aligned */
          #why .container {
            text-align: left;
          }
          #why .row {
            margin-left: auto;
            margin-right: auto;
            text-align: left;
          }
          
          /* FAQ section - left aligned */
          #faq .container {
            text-align: left;
          }
          #faq .row {
            margin-left: auto;
            margin-right: auto;
          }
          #faq .accordion {
            width: 100%;
          }
          #faq .accordion-button {
            text-align: left !important;
          }
          #faq .accordion-body {
            text-align: left !important;
          }
          
          /* Mobile styles */
          @media (max-width: 768px) {
            /* Global mobile centering */
            section .container {
              text-align: center;
            }
            section .row {
              margin-left: 0;
              margin-right: 0;
              justify-content: center !important;
            }
            section .col-6,
            section .col-md-3,
            section .col-md-4,
            section .col-lg-6,
            section .col-lg-8 {
              display: flex;
              flex-direction: column;
              align-items: center;
              text-align: center;
            }
            
            /* Hero section */
            #hero h1 {
              margin-top: 0.5rem !important;
            }
            #hero, #hero * {
              text-align: center;
            }
            #hero .google-btn {
              width: 260px !important;
              min-width: 260px !important;
              max-width: 260px !important;
              height: 52px !important;
              border-radius: 8px !important;
            }
            #hero .google-btn .google-icon-wrapper {
              width: 48px !important;
              height: 48px !important;
              left: 2px !important;
              top: 2px !important;
              border-radius: 6px !important;
            }
            #hero .google-btn .google-icon {
              width: 26px !important;
              height: 26px !important;
            }
            #hero .google-btn .btn-text {
              font-size: 16px !important;
              left: 55% !important;
            }
            #hero .mb-5 {
              margin-bottom: 3rem !important;
            }
            #hero .mb-4 {
              margin-top: 1rem !important;
              margin-bottom: 2rem !important;
            }
            
            /* About section demo cards */
            #about .row.g-4 {
              --bs-gutter-y: 0.75rem;
            }
            
            /* Why section - keep left aligned on mobile */
            #why .row {
              text-align: left !important;
            }
            #why .col-lg-6 {
              align-items: flex-start !important;
              text-align: left !important;
            }
            #why h2,
            #why p,
            #why ul,
            #why li {
              text-align: left !important;
            }
            
            /* FAQ section - keep accordion full width, left aligned */
            #faq .container {
              text-align: left !important;
            }
            #faq .col-lg-8 {
              width: 100% !important;
              max-width: 100% !important;
              padding-left: 0;
              padding-right: 0;
              text-align: left !important;
              align-items: flex-start !important;
            }
            #faq .accordion {
              width: 100% !important;
            }
            #faq .accordion-button,
            #faq .accordion-body {
              text-align: left !important;
            }
          }
        `})]}));export{C as default};
