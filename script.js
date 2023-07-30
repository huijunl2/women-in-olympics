// Global parameters
var data;  // for storing the loaded data
var currentSlide = 1;
var currentDimension = "Participation";

const maxFemaleParticipants = 5034;
const maxMedalsWonByWomen = 969;
const maxSportsWomenParticipatedIn = 34;

// Define SVG dimensions and margins
var svgWidth = 980;
var svgHeight = 600;
var margin = {top: 70, right: 50, bottom: 30, left: 50};
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

var tooltip = d3.select("#tooltip-container").append("div") 
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("display", "none");

var dimensions = ["Participation", "Medal Wins", "Sports Participated"];

var annotations = [
    { scene: 1, year: 1900, text: "First recorded participation of\nwomen in the Olympics." },
    { scene: 1, year: 1984, text: "women's marathon increased\nin female participation." },
    { scene: 2, year: 1928, text: "First major influx of female\nmedal winners" },
    { scene: 2, year: 1984, text: "exceed 500 for the first time" },
    { scene: 3, year: 1928, text: "Introduction of athletics and\ngymnastics boosts participation." },
    { scene: 3, year: 1964, text: "More sports open to women,\nindicating progress." },
    { scene: 3, year: 1900, text: " women made their debut,\nparticipating in golf and tennis." }
];

function filterOutOlympicWinterGames(data) {
    return data.filter(data => !['1994', '1998', '2002', '2006', '2010', '2014'].includes(data.Year));
}

// Function to load the data
function loadData() {
    return d3.csv('athlete_events.csv')
        .then(function(data) {
            return data;
        })
        .catch(function(error) {
            console.error("Error loading data: ", error);
        });
}

function initialize() {
    // Configure the graph.
    d3.select("#chart svg")
        .style('width', svgWidth + 'px')
        .style('height', svgHeight + 'px');

    loadData().then(function(loadedData) {
        data = loadedData;
        console.log(data);  // to verify that the data was loaded
        d3.selectAll(".page-list-button").on("click", function() {
            var pageNum = d3.select(this).attr("data-page");
            if (pageNum == "next") {
                pageNum = currentSlide == 3 ? 3 : currentSlide + 1;
            } else {
                pageNum = +pageNum;
            }
            setPage(pageNum);
        });
    
        d3.selectAll("input[name='dimension']").on("change", function() {
            var dimension = d3.select(this).property("value");
            setDimension(dimension);
        });
    

        // Draw the initial scene
        setPage(currentSlide);
        setDimension(currentDimension);
    }).catch(function(error) {
        console.log("Error loading data: ", error);
    });
}


// Function to draw x-axis
function drawXAxis() {
    var xScale = d3.scaleLinear()
        .domain([1896, 2017])  
        .range([0, chartWidth]);  // width is the width of SVG

    var xAxis = d3.axisBottom(xScale);

    d3.select("#chart svg").append("g")
        .attr("transform", `translate(${margin.left}, ${chartHeight + margin.top})`)  // height is the height of SVG
        .call(xAxis);
    d3.select('#chart svg').append('text')
        .style('font-size', '11px')
        .attr('text-anchor', 'middle')
        .attr('x', margin.left + chartWidth / 2)
        .attr('y', svgHeight)
        .text('Year');
}

function drawYAxis(countMax, ratioMax, barWidth = 0, leftTitle = 'text1', rightTitle = 'text2') {
    // Left y-axis (count)
    var yScaleCount = d3.scaleLinear()
        .domain([0, countMax]) // Set domain to max count
        .range([chartHeight, 0]);

    var yAxisCount = d3.axisLeft(yScaleCount);

    // Append left y-axis
    d3.select("#chart svg").append("g")
        .attr("transform", `translate(${margin.left - barWidth / 2}, ${margin.top})`)
        .call(yAxisCount);
        
    d3.select('#chart svg').append('text')
        .style('font-size', '12px')
        .attr('text-anchor', 'begin')
        .attr("transform", `translate(10, ${margin.top * 0.75})`)
        .text(leftTitle);

    // Right y-axis (ratio)
    var yScaleRatio = d3.scaleLinear()
        .domain([0, ratioMax]) // Set domain to max ratio
        .range([chartHeight, 0]);

    var yAxisRatio = d3.axisRight(yScaleRatio)
        .tickFormat(d3.format(".0%")); // Convert decimal to percentage

    // Append right y-axis
    d3.select("#chart svg").append("g")
    .attr("transform", `translate(${svgWidth - margin.right + barWidth / 2}, ${margin.top})`)
    .call(yAxisRatio);
        
    d3.select('#chart svg').append('text')
        .style('font-size', '12px')
        .attr('text-anchor', 'end')
        .attr("transform", `translate(${svgWidth - 20}, ${margin.top * 0.75})`)
        .text(rightTitle);
}

function drawTitle(title) {
    return;
    d3.select('#chart svg').append('text')
        .style('font-size', '17px')
        .attr('text-anchor', 'middle')
        .attr('x', margin.left + chartWidth / 2)
        .attr('y', margin.top / 2)
        .text(title);
}


// Function to draw the text for the current scene
function drawText(pageNum) {
    // Define the text for each scene
    let sceneText = {
        1: {
            title: "The Dawn of a New Era: Women Step Into the Olympic Arena",
            text: "The Olympic Games, a global celebration of athletic prowess and competitive spirit, did not always showcase the talents of both genders. Our journey begins in 1896, a time when women were mere spectators, barred from competing. It wasn't until 1900 that women made their initial appearance in a handful of sports. Through the lens of this visualization, we'll witness the dramatic rise in women's participation over time, a testament to the relentless push for gender equality in sports."
        },
        2: {
            title: "Shattering the Glass Ceiling: The Triumphs of Women in the Olympics",
            text: "The progressive increase in women's participation set the stage for spectacular performances and memorable victories. These triumphs were not just wins for the individual athletes, but symbolic victories for women across the world. As we delve into this chapter of the story, we observe not just the increasing presence of women in the Olympics, but their transformative journey from competitors to champions."
        },
        3: {
            title: "Breaking Boundaries: The Expansion of Women's Participation Across Sports",
            text: "The narrative of women in the Olympics is not just about rising numbers, but also about diversification. As opportunities expanded, women ventured into new territories, conquering an increasingly diverse array of sports. This phase of our journey will uncover the extent of this diversification, celebrating the spirit of women athletes who defied societal norms and ventured into the unknown, forever changing the landscape of the Olympics."
        }
    };

    // Clear existing text
    d3.select("#scene-text").html("");

    // Append the title and text for the current scene
    d3.select("#scene-text")
        .append("h3").attr("class", "scene-title").text(sceneText[pageNum].title)
        .append("p").attr("class", "scene-description").text(sceneText[pageNum].text);
}



// Function to draw the graph for the current scene
function drawGraph(pageNum) {
    // Clear existing graph
    var svg = d3.select("#chart svg");
    svg.html("");

    // Calculate the width of each bar
    var numberOfBars = 2016 - 1896 + 1;  // The number of years from 1896 to 2016
    var gap = 1;
    var barWidth = (svgWidth - (numberOfBars - 1) * gap) / numberOfBars;

    if (pageNum == 1) {
        var contentGroup = d3.select('#chart svg')
            .append('g')
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Group by year and gender, and count the number of participants
        var countsByYearAndGender = d3.rollup(data, v => v.length, d => d.Year, d => d.Sex);

        // Convert the Map to an array of objects for easier processing
        var maxParticipantPerGame = 0;
        var countData = Array.from(countsByYearAndGender, ([Year, nestedMap]) => {
            var obj = {Year: Year, M: 0, F: 0, femaleRatio: 0};
            for (let [Sex, Count] of nestedMap) {
                obj[Sex] = Count;
            }
            obj.femaleRatio = obj.F / (obj.M + obj.F);
            maxParticipantPerGame = Math.max(maxParticipantPerGame, obj.M + obj.F);
            return obj;
        });
        countData = filterOutOlympicWinterGames(countData);

        // Sort the data by year
        countData.sort(function(a, b) { return a.Year - b.Year; });

        // Set up scales
        var xScale = d3.scaleLinear()
            .domain([1896, 2016])  // input domain: range of years
            .range([0, chartWidth]);  // output range: width of the SVG container

        var yScale = d3.scaleLinear()
            .domain([0, maxParticipantPerGame])  // input domain: range of counts
            .range([0, chartHeight]);  // output range: height of the SVG container

        // Create a line generator for the count of female participants
        var lineGenerator = d3.line()
            .x(function(d) { return xScale(d.Year); })  // set the x-coordinate for each data point
            .y(function(d) { return chartHeight - yScale(d.F); });  // set the y-coordinate for each data point based on the ratio


        // Draw the bars for the number of male participants each year
        contentGroup.selectAll(".bar-male")
            .data(countData)
            .enter().append("rect")
            .attr("class", "bar-male")
            .attr("x", function(d) { return xScale(d.Year) - barWidth / 2; })
            .attr("y", function(d) { return chartHeight - yScale(d.M + d.F); }) // The bar starts from the top
            .attr("width", barWidth)
            .attr("height", function(d) { return yScale(d.M); }) // The height of the bar corresponds to the proportion of male participants
            .attr("fill", "lightblue"); // The fill color for male is lightblue

        // Draw the bars for the number of female participants each year
        contentGroup.selectAll(".bar-female")
            .data(countData)
            .enter().append("rect")
            .attr("class", "bar-female")
            .attr("x", function(d) { return xScale(d.Year) - barWidth / 2; })
            .attr("y", function(d) { return chartHeight - yScale(d.F); }) // The bar starts from the end of the male section
            .attr("width", barWidth)
            .attr("height", function(d) { return yScale(d.F); }) // The height of the bar corresponds to the proportion of female participants
            .attr("fill", "lightcoral"); // The fill color for female is lightcoral

        // Draw the line for the count of female participants
        contentGroup
            .append("path")
            .datum(countData)  // bind the countData to the path element
            .attr("d", lineGenerator)  // set the "d" attribute to the path data
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 3);




        // Get the annotations for the current scene
        var sceneAnnotations = annotations.filter(function(annotation) {
            return annotation.scene === pageNum;
        });

        // Draw the annotations
        sceneAnnotations.forEach(function(annotation) {
            // Find the data point for this year
            var dataPoint = countData.find(function(d) { return d.Year == annotation.year; });

            // Check if the data point exists
            if (!dataPoint) {
                console.error('No data point found for year ' + annotation.year);
                return;
            }

            // Calculate the y-value for the data point
            var yValue = chartHeight - yScale(dataPoint.F);

            var contentGroup = d3.select('#chart svg')
                .append('g')
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

            var lines = annotation.text.split('\n');  // Split the annotation text into separate lines

            // Add the rectangle (text box)
            contentGroup.append("rect")
                .attr("x", xScale(annotation.year) + 10)  // Move the box to the right of the line
                .attr("y", yValue - 100 - 15*lines.length)  // Adjust the position as needed
                .attr("width", 180)  // Adjust the size as needed
                .attr("height", 10 + 15*lines.length)  // Adjust the size as needed
                .attr("fill", "white")
                .attr("stroke", "black");

            contentGroup.append("text")
                .attr("x", xScale(annotation.year) + 15)  // Position the text within the box
                .attr("y", yValue - 100 - 15*(lines.length-1))  // Position the text within the box
                .attr("class", "annotation")
                .attr("fill", "black")  // Set the text color to black
                .selectAll("tspan")
                .data(lines)
                .enter().append("tspan")  // Add a tspan for each line
                    .attr("x", xScale(annotation.year) + 15)  // Position each line within the box
                    .attr("dy", (d, i) => i > 0 ? "1.2em" : 0)  // Add a line height for all lines except the first one
                    .text(d => d);  // Set the text of each line

            // Add the line connecting the text box to the data point
            contentGroup.append("line")
                .attr("x1", xScale(annotation.year))
                .attr("y1", yValue)
                .attr("x2", xScale(annotation.year) + 10)  // Adjust the end position of the line to the left side of the box
                .attr("y2", yValue - 90)  // Adjust the end position of the line to the top of the box
                .attr("stroke", "black")
                .attr("stroke-width", 1);
        });

        drawXAxis([1896, 2016]);
        drawYAxis(maxParticipantPerGame, 1, barWidth, 'Number of participants', 'Sex Ratio');

        // Add a circle for each data point
        contentGroup.selectAll("dot")
            .data(countData)
            .enter().append("circle")
            .attr("r", 4)
            .attr("cx", function(d) { return xScale(d.Year); })
            .attr("cy", function(d) { return chartHeight - yScale(d.F); }) // Adjust this according to your yScale and data
            .on("mouseover", function(event, d) {
                tooltip.style("display", "block");
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .97);
                tooltip.html(`<div>Year: ${d.Year}</div><div>Female Participants: ${d.F}</div><div>Female Ratio: ${(d.femaleRatio * 100).toFixed(2)}%</div>`)
                    .style("left", (event.pageX) + "px")     
                    .style("top", (event.pageY - 28) + "px");    
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0)
                    .on("end", () => {tooltip.style("display", "none");});
            });

            drawTitle('Chart of Female Participation');
    }


    else if (pageNum == 2) {
        // Filter the data to include only rows where a medal was won
        var medalData = data.filter(d => d.Medal != "NA");
        
        // Group by year and gender, and count the number of medals
        var medalCountsByYearAndGender = d3.rollup(medalData, v => v.length, d => d.Year, d => d.Sex);
    
        // Convert the Map to an array of objects for easier processing
        var maxMedalsPerGame = 0;
        var medalCountData = Array.from(medalCountsByYearAndGender, ([Year, nestedMap]) => {
            var obj = {Year: Year, M: 0, F: 0, femaleRatio: 0};
            for (let [Sex, Count] of nestedMap) {
                obj[Sex] = Count;
            }
            obj.femaleRatio = obj.F / (obj.M + obj.F);
            maxMedalsPerGame = Math.max(maxMedalsPerGame, obj.M + obj.F);
            return obj;
        });
        medalCountData = filterOutOlympicWinterGames(medalCountData);

        var yScale = d3.scaleLinear()
            .domain([0, maxMedalsPerGame])  // input domain: range of counts
            .range([0, chartHeight]);  // output range: height of the SVG container
    
        // Sort the data by year
        medalCountData.sort(function(a, b) { return a.Year - b.Year; });
    
        // Set up scales
        var xScale = d3.scaleLinear()
            .domain([1896, 2016])  // input domain: range of years
            .range([0, chartWidth]);  // output range: width of the SVG container
    
        // Create a line generator for the count of medals won by women
        var lineGenerator = d3.line()
        .x(function(d) { return xScale(d.Year); })  // set the x-coordinate for each data point
        .y(function(d) { return chartHeight - yScale(d.F); });  // set the y-coordinate for each data point
    
        var contentGroup = d3.select('#chart svg')
            .append('g')
            .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
        // Draw the bars for the number of medals won by men each year
        contentGroup.selectAll(".bar-male")
            .data(medalCountData)
            .enter().append("rect")
            .attr("class", "bar-male")
            .attr("x", function(d) { return xScale(d.Year) - barWidth / 2; })
            .attr("y", function(d) { return chartHeight - yScale(d.M + d.F); }) // The bar starts from the top            .attr("width", barWidth)
            .attr("width", barWidth)
            .attr("height", function(d) { return yScale(d.M); }) // The height of the bar corresponds to the proportion of medals won by men
            .attr("fill", "lightblue");
    
        // Draw the bars for the number of medals won by women each year
        contentGroup.selectAll(".bar-female")
        .data(medalCountData)
        .enter().append("rect")
        .attr("class", "bar-female")
        .attr("x", function(d) { return xScale(d.Year) - barWidth / 2; })
        .attr("y", function(d) { return chartHeight - yScale(d.F); }) // The bar starts from the end of the male section
        .attr("width", barWidth)
        .attr("height", function(d) { return yScale(d.F); }) // The height of the bar corresponds to the proportion of medals won by women
        .attr("fill", "lightcoral");
    
        // Draw the line for the count of medals won by women
        contentGroup
        .append("path")
        .datum(medalCountData)  // bind the medalCountData to the path element
        .attr("d", lineGenerator)  // set the "d" attribute to the path data
        .attr("fill", "none")
        .attr("stroke", "red")  // change the stroke color to red
        .attr("stroke-width", 3);
    
        // Get the annotations for the current scene
        var sceneAnnotations = annotations.filter(function(annotation) {
            return annotation.scene === pageNum;
        });
    
        // Draw the annotations
        sceneAnnotations.forEach(function(annotation) {
            // Find the data point for this year
            var dataPoint = medalCountData.find(function(d) { return d.Year == annotation.year; });
    
            // Check if the data point exists
            if (!dataPoint) {
                console.error('No data point found for year ' + annotation.year);
                return;
            }
    
            // Calculate the y-value for the data point
            var yValue = chartHeight - yScale(dataPoint.F);
    
            var contentGroup = d3.select('#chart svg')
                .append('g')
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

            var lines = annotation.text.split('\n');  // Split the annotation text into separate lines
    
            // Add the rectangle (text box)
            contentGroup.append("rect")
                .attr("x", xScale(annotation.year) + 10)  // Move the box to the right of the line
                .attr("y", yValue - 130 - 15*lines.length)  // Adjust the position as needed
                .attr("width", 180)  // Adjust the size as needed
                .attr("height", 10 + 15*lines.length)  // Adjust the size as needed
                .attr("fill", "white")
                .attr("stroke", "black");

            contentGroup.append("text")
                .attr("x", xScale(annotation.year) + 15)  // Position the text within the box
                .attr("y", yValue - 130 - 15*(lines.length-1))  // Position the text within the box
                .attr("class", "annotation")
                .attr("fill", "black")  // Set the text color to black
                .selectAll("tspan")
                .data(lines)
                .enter().append("tspan")  // Add a tspan for each line
                    .attr("x", xScale(annotation.year) + 15)  // Position each line within the box
                    .attr("dy", (d, i) => i > 0 ? "1.2em" : 0)  // Add a line height for all lines except the first one
                    .text(d => d);  // Set the text of each line

            // Add the line connecting the text box to the data point
            contentGroup.append("line")
                .attr("x1", xScale(annotation.year))
                .attr("y1", yValue)
                .attr("x2", xScale(annotation.year) + 10)  // Adjust the end position of the line to the left side of the box
                .attr("y2", yValue - 120)  // Adjust the end position of the line to the top of the box
                .attr("stroke", "black")
                .attr("stroke-width", 1);

        });
    
        drawXAxis([1896, 2016]);
        drawYAxis(maxMedalsPerGame, 1, barWidth, 'Number of Medels', 'Sex Ratio');  // Since the total height of the bars is constant, the y-axis domain is [0, 1]

        // Add a circle for each data point
        contentGroup.selectAll("dot")
            .data(medalCountData)
            .enter().append("circle")
            .attr("r", 4)
            .attr("cx", function(d) { return xScale(d.Year); })
            .attr("cy", function(d) { return chartHeight - yScale(d.F); }) // Adjust this according to your yScale and data
            .on("mouseover", function(event, d) {
                tooltip.style("display", "block");
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .97);
                tooltip.html(`<div>Year: ${d.Year}</div><div>Female Medels: ${d.F}</div><div>Female Ratio: ${(d.femaleRatio * 100).toFixed(2)}%</div>`)
                    .style("left", (event.pageX) + "px")     
                    .style("top", (event.pageY - 28) + "px");    
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0)
                    .on("end", () => {tooltip.style("display", "none");});
            });

        drawTitle('Chart of Female Medel Wins');
    }
    
    else if (pageNum == 3) {
        // Filter the data to include only rows where the participant is female or male
        var femaleData = data.filter(d => d.Sex == "F");
        var maleData = data.filter(d => d.Sex == "M");
    
        // Group by year and sport, and count the number of participants in each sport for both female and male
        var countsByYearAndSportFemale = d3.rollup(femaleData, v => v.length, d => d.Year, d => d.Sport);
        var countsByYearAndSportMale = d3.rollup(maleData, v => v.length, d => d.Year, d => d.Sport);
    
        var countsByYearFemale = Array.from(countsByYearAndSportFemale, ([year, sportsMap]) => ([year, sportsMap.size]));
        var countsByYearMale = Array.from(countsByYearAndSportMale, ([year, sportsMap]) => ([year, sportsMap.size]));
    
        // Now, countsByYearFemale and countsByYearMale are array of [year, count] pairs. 
        // Convert them to Map for easy lookup
        countsByYearFemale = new Map(countsByYearFemale);
        countsByYearMale = new Map(countsByYearMale);
    
        // Convert the Maps to an array of objects for easier processing
        var allYears = Array.from(new Set([...countsByYearFemale.keys(), ...countsByYearMale.keys()])).sort();
        var maxSportsPerGame = 0;
        var sportCountData = allYears.map(Year => {
            var CountFemale = countsByYearFemale.get(Year) || 0;
            var CountMale = countsByYearMale.get(Year) || 0;
            maxSportsPerGame = Math.max(maxSportsPerGame, CountFemale + CountMale);
            return { Year: Year, CountFemale: CountFemale, CountMale: CountMale, femaleRatio: CountFemale / (CountFemale + CountMale) };
        });
        sportCountData = filterOutOlympicWinterGames(sportCountData);
    
        var yScale = d3.scaleLinear()
            .domain([0, maxSportsPerGame])  // input domain: range of counts
            .range([0, chartHeight]);  // output range: height of the SVG container
        
    
        // Set up scales
        var xScale = d3.scaleLinear()
            .domain([1896, 2016])  // input domain: range of years
            .range([0, chartWidth]);  // output range: width of the SVG container
    
        var contentGroup = d3.select('#chart svg')
        .append('g')
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
        // Draw the bars for the number of distinct sports in which women have participated each year
        contentGroup.selectAll(".bar-female")
        .data(sportCountData)
        .enter().append("rect")
        .attr("class", "bar-female")
        .attr("x", function(d) { return xScale(d.Year) - barWidth / 2; })
        .attr("y", function(d) { return chartHeight - yScale(d.CountFemale); })
        .attr("width", barWidth)
        .attr("height", function(d) { return yScale(d.CountFemale); })
        .attr("fill", "lightcoral");  // The fill color for female is red
    
        // Draw the bars for the number of distinct sports in which men have participated each year
        contentGroup.selectAll(".bar-male")
        .data(sportCountData)
        .enter().append("rect")
        .attr("class", "bar-male")
        .attr("x", function(d) { return xScale(d.Year) - barWidth / 2; })
        .attr("y", function(d) { return chartHeight - yScale(d.CountMale + d.CountFemale); })
        .attr("width", barWidth)
        .attr("height", function(d) { return yScale(d.CountMale); })
        .attr("fill", "lightblue");  // The fill color for male is blue
    
        // Create a line generator for the count of distinct sports in which women have participated
        var lineGenerator = d3.line()
            .x(function(d) { return xScale(d.Year); })  // set the x-coordinate for each data point
            .y(function(d) { return chartHeight - yScale(d.CountFemale); }); 
    
        // Draw the line for the count of distinct sports in which women have participated
        contentGroup.append("path")
            .datum(sportCountData)  // bind the sportCountData to the path element
            .attr("d", lineGenerator)  // set the "d" attribute to the path data
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 3);
    
        // Get the annotations for the current scene
        var sceneAnnotations = annotations.filter(function(annotation) {
            return annotation.scene === pageNum;
        });
    
        // Draw the annotations
        sceneAnnotations.forEach(function(annotation) {
            // Find the data point for this year
            var dataPoint = sportCountData.find(function(d) { return d.Year == annotation.year; });
    
            // Check if the data point exists
            if (!dataPoint) {
                console.error('No data point found for year ' + annotation.year);
                return;
            }
    
            // Calculate the y-value for the data point
            var yValue = chartHeight - yScale(dataPoint.CountFemale);
    
            var contentGroup = d3.select('#chart svg')
                .append('g')
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

            var lines = annotation.text.split('\n');  // Split the annotation text into separate lines
    
            // Add the rectangle (text box)
            contentGroup.append("rect")
                .attr("x", xScale(annotation.year) + 10)  // Move the box to the right of the line
                .attr("y", yValue - 130 - 15*lines.length)  // Adjust the position as needed
                .attr("width", 180)  // Adjust the size as needed
                .attr("height", 10 + 15*lines.length)  // Adjust the size as needed
                .attr("fill", "white")
                .attr("stroke", "black");

            contentGroup.append("text")
                .attr("x", xScale(annotation.year) + 15)  // Position the text within the box
                .attr("y", yValue - 130 - 15*(lines.length-1))  // Position the text within the box
                .attr("class", "annotation")
                .attr("fill", "black")  // Set the text color to black
                .selectAll("tspan")
                .data(lines)
                .enter().append("tspan")  // Add a tspan for each line
                    .attr("x", xScale(annotation.year) + 15)  // Position each line within the box
                    .attr("dy", (d, i) => i > 0 ? "1.2em" : 0)  // Add a line height for all lines except the first one
                    .text(d => d);  // Set the text of each line

            // Add the line connecting the text box to the data point
            contentGroup.append("line")
                .attr("x1", xScale(annotation.year))
                .attr("y1", yValue)
                .attr("x2", xScale(annotation.year) + 10)  // Adjust the end position of the line to the left side of the box
                .attr("y2", yValue - 120)  // Adjust the end position of the line to the top of the box
                .attr("stroke", "black")
                .attr("stroke-width", 1);

        });
    
        drawXAxis([1896, 2016]);
        drawYAxis(maxSportsPerGame, 1, barWidth, 'Number of sports', 'Sex Ratio');  // Since the total height of the bars is constant, the y-axis domain is [0, 1]
        
        // Add a circle for each data point
        contentGroup.selectAll("dot")
            .data(sportCountData)
            .enter().append("circle")
            .attr("r", 4)
            .attr("cx", function(d) { return xScale(d.Year); })
            .attr("cy", function(d) { return chartHeight - yScale(d.CountFemale); }) // Adjust this according to your yScale and data
            .on("mouseover", function(event, d) {
                tooltip.style("display", "block");
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .97);
                tooltip.html(`<div>Year: ${d.Year}</div><div>Female Participated Sports: ${d.CountFemale}</div><div>Female Ratio: ${(d.femaleRatio * 100).toFixed(2)}%</div>`)
                    .style("left", (event.pageX) + "px")     
                    .style("top", (event.pageY - 28) + "px");    
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", 0)
                    .on("end", () => {tooltip.style("display", "none");});
            });

            drawTitle('Chart of Female Sports Participated');
    }
    
}

// Add this helper function that maps dimension to page number
function dimensionToPageNum(dimension) {
    switch (dimension) {
        case "Participation":
            return 1;
        case "Medal Wins":
            return 2;
        case "Sports Participated":
            return 3;
        default:
            return currentSlide;
    }
}

// Function to update the page list based on current slide
// Update the page list
function updatePageList(pageNum) {
    console.log('updatePageList is called with pageNum:', pageNum);

    // Remove the "active" class from all page list buttons
    d3.selectAll(".page-list-button").classed("active", false);

    // Add the "active" class to the current page list button
    var selectedButton = d3.select(".page-list-button[data-page='" + pageNum + "']");
    console.log('selectedButton node:', selectedButton.node());  // Add this line
    selectedButton.classed("active", true);

    // Disable the "Next" button on the last page
    d3.select(".page-list-button[data-page='next']").classed("disabled", pageNum == 3);
}




// Function to update the dimension list based on current dimension
function updateDimensionList(dimension) {
    // Remove the "checked" attribute from all dimension radio inputs
    d3.selectAll("input[name='dimension']").property("checked", false);

    // Add the "checked" attribute to the current dimension radio input
    d3.select("input[name='dimension'][value='" + dimension + "']").property("checked", true);
}


// Function to set the current page and update the visualization accordingly
function setPage(pageNum) {
    // Set the current slide
    currentSlide = pageNum;

    // Clear the current scene
    clearScene();

    // Update the page list
    updatePageList(pageNum);

    // Draw the new scene
    drawText(pageNum);
    drawGraph(pageNum);

    // Update the dimension list
    updateDimensionList(dimensions[pageNum - 1]);
}


// Function to set the current dimension and update the visualization accordingly
function setDimension(dimension) {
    // Set the current dimension
    currentDimension = dimension;

    // Convert the dimension to a page number
    currentSlide = dimensionToPageNum(dimension);

    // Clear the current scene
    clearScene();

    // Update the page list
    updatePageList(currentSlide);

    // Update the dimension list
    updateDimensionList(dimension);

    // Draw the new scene
    drawText(currentSlide);
    drawGraph(currentSlide);
}


// Function to clear the current scene
function clearScene() {
    // Clear the scene title, text, and chart
    d3.select("#scene-title").html("");
    d3.select("#scene-text").html("");
    d3.select("#chart svg").html("");
}


initialize();