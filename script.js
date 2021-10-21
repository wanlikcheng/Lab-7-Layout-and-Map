d3.json("airports.json", d3.autoType)
    .then(data => {
        d3.json("world-110m.json").then(worldmap => {
            console.log(worldmap);
        
        })
        console.log(data);
        console.log(data.nodes);
        console.log(data.links);

        // margin convention
        const width = 400;
        const height = 400;

        const svg = d3
            .select(".node-diagram")
            .append("svg")
            .attr("viewBox", [-width / 2, -height / 2, width, height])

        // sizing scale for circles based on passenger count
        const circleSize = d3
            .scaleLinear()
            .domain(d3.extent(data.nodes, d => d.passengers))
            .range([3, 10]);
        
        // size for each circle
        data.nodes.forEach(d => {
            d.r = circleSize(d.passengers);
        });
        
        // force simulation
        var force = d3.forceSimulation(data.nodes)
            .force("link", d3.forceLink(data.links))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter().x(width/100).y(height/100))
            .force("collide", d3.forceCollide().radius(function(d) {
                    return d.r;
                })
            );

        // create edges as lines
        var edges = svg
            .selectAll("line")
            .data(data.links)
            .enter()
            .append("line")
            .style("stroke", "#ccc")
            .style("stroke-width", 1);

        // create nodes
        var nodes = svg
            .selectAll("circle")
            .data(data.nodes)
            .enter()
            .append("circle")
            .attr("fill", "orange")
            .attr("r", d => d.r)
        
        nodes.append("title").text(d => d.name); // add labels

        //Every time the simulation "ticks", this will be called
        force.on("tick", function() {
            edges.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            nodes.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

        });
        //Define drag event functions
        function dragStarted(d) {
            if (!d3.event.active) {
                force.alphaTarget(0.3).restart();
            }
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragging(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragEnded(d) {
            if (!d3.event.active) {
                force.alphaTarget(0);
            }
            d.fx = null;
            d.fy = null;
        }

        // dragging interaction
        nodes.call(d3.drag()  //Define what to do on drag events
        .on("start", dragStarted)
        .on("drag", dragging)
        .on("end", dragEnded));
    })




