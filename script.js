var data;
var worldmap;
var visType = "Force";

d3.json("airports.json", d3.autoType)
    .then(data => {
        // loading in map
        d3.json("world-110m.json").then(worldmap => {
            console.log(worldmap);
            console.log(data);
            console.log(data.nodes);
            console.log(data.links);
    
            // margin convention
            const width = 900;
            const height = 600;

            const svg = d3
                .select(".node-diagram")
                .append("svg")
                .attr("viewBox", [0, 0, width, height])
            
            // ----------------------------- MAP LAYOUT -----------------------------
            
            const features = topojson.feature(worldmap, worldmap.objects.countries).features;
            console.log("Features ", features)

            var projection = d3.geoMercator()
                .fitExtent(
                    [[0, 0], [width, height]], // available screen space
                    topojson.feature(worldmap, worldmap.objects.countries) // geoJSON object
                )
                .scale(100);
            
            var path = d3.geoPath()
                .projection(projection); 

            svg.selectAll("path")
                .data(features)
                .enter()
                .append("path")
                .attr("d", path);
                
            svg.append("path")
                .datum(topojson.mesh(worldmap, worldmap.objects.countries))
                .attr("d", path)
                .attr('fill', 'none')
                .attr('stroke', 'white')
                .attr("class", "subunit-boundary");
            
            // ----------------------------- FORCE DIAGRAM -----------------------------
    
            // sizing scale for circles based on passenger count
            const circleSize = d3
                .scaleLinear()
                .domain(d3.extent(data.nodes, d => d.passengers))
                .range([5, 10]);
            
            // size for each circle
            data.nodes.forEach(d => {
                d.r = circleSize(d.passengers);
            });
            
            // force simulation
            var force = d3.forceSimulation(data.nodes)
                .force("link", d3.forceLink(data.links))
                .force("charge", d3.forceManyBody())
                .force("x", d3.forceX())
                .force("y", d3.forceY())
                .force("center", d3.forceCenter().x(width/2).y(height/2))
                .force("collide", d3.forceCollide().radius(function(d) {
                        return d.r;
                    })
                );
    
            // create edges as lines
            var edges = svg
                .selectAll("line")
                .data(data.links)
                .join("line")
                .style("stroke", "#ccc")
                .style("stroke-width", 1);
    
            // create nodes
            var nodes = svg
                .selectAll("circle")
                .data(data.nodes)
                .join("circle")
                .attr("fill", "orange")
                .attr("r", d => d.r);
            
            // add labels
            nodes.append("title").text(d => d.name);
    
            //Every time the simulation "ticks", this will be called
            force.on("tick", function() {
                edges.attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });
    
                nodes.attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; });
    
            });

            // create drag interaction
            const drag = d3
                .drag()
                .on("start", event => {
                    force.alphaTarget(0.3).restart();
                    event.subject.fx = event.x;
                    event.subject.fy = event.y;
                })
                .on("drag", event => {
                    event.subject.fx = event.x;
                    event.subject.fy = event.y;
                })
                .on("end", event => {
                    force.alphaTarget(0.0);
                    event.subject.fx = null;
                    event.subject.fy = null;
                })
                .filter(event => visType === "Force")

            nodes.call(drag);

            d3.selectAll("input[name = type]").on("change", event=>{
                visType = event.target.value;// selected button
                console.log(event.target.value);
                switchLayout();
            });
            
            function switchLayout() {
                if (visType === "Map") {
                        // stop the simulation
                        // set the positions of links and nodes based on geo-coordinates
                        // set the map opacity to 1
                        console.log("visType", visType);

                    } else { 
                        // force layout
                        // restart the simulation
                        // set the map opacity to 0
                        console.log("visType", visType);   
                    }
                }
        })
        
    })