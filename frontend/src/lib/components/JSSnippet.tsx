import React from 'react'
import { CodeSnippet, Language } from 'scenes/ingestion/frameworks/CodeSnippet'
import { useValues } from 'kea'
import { teamLogic } from 'scenes/teamLogic'

export function JSSnippet(): JSX.Element {
    const { currentTeam } = useValues(teamLogic)

    return (
        <CodeSnippet language={Language.HTML}>{`
<script>
    !function(t,e){var o,n,p,r;e.__SV||(window.analytickit=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="analytickit",u.people=u.people||[],u.toString=function(t){var e="analytickit";return"analytickit"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.analytickit||[]);
    analytickit.init('${currentTeam?.api_token}',{api_host:'${window.location.origin}'})

    // Check if Web3 is injected by the browser (Mist/MetaMask)
    var script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/gh/ethereum/web3.js@1.3.4/dist/web3.min.js";
    
    script.onload = function() {
        // This code will execute after the Ethereum/Web3 script has loaded
        if (typeof window.ethereum !== 'undefined' || typeof window.web3 !== 'undefined') {
            let web3 = new Web3(window.ethereum || window.web3.currentProvider);
    
            // Request account access if needed
            window.ethereum.enable().then(accounts => {
                // Get the public address of the first account
                let publicAddress = accounts[0];
    
                // Capture the public address and other required data
                let data = {
                    "$crypto_wallet_public_address": publicAddress
                };
    
                // Send the data to the server using the analytickit library
                analytickit.capture('WalletLogin', data);
            }).catch(error => {
                console.error("User denied account access");
            });
        }
    };   
    document.head.appendChild(script);
    
</script>
`}</CodeSnippet>
    )
}
