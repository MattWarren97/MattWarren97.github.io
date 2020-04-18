
const overall_width = 1600;
const instruction_width=600;
const content_width = 1000;
const overall_height = 900;

const instruction_height = overall_height;
const instruction_margin = {top: 75, right: 50, bottom: 200, left: 50};
const instruction_marginnedWidth = (instruction_width-instruction_margin.right) - instruction_margin.left;
const instruction_marginnedHeight = (instruction_height-instruction_margin.top) - instruction_margin.bottom;

const navigationBar_width = content_width;
const navigationBar_height = 100;
const navigationBar_margin  = { top: 0, right: 100, bottom: 0, left: 100 };
const navigationBar_marginnedWidth = (content_width - navigationBar_margin.right)-navigationBar_margin.left;

const nav_offset_Y = navigationBar_height + navigationBar_margin.top + navigationBar_margin.bottom;

const stackedSankeyGraph_width = content_width;
const stackedSankeyGraph_height = 400;
const stackedSankeyGraph_margin = { top: 50, right: 100, bottom: 50, left: 100 };
const stackedSankey_marginnedWidth = (content_width - stackedSankeyGraph_margin.right)-stackedSankeyGraph_margin.left;
const stackedSankey_marginnedHeight = (stackedSankeyGraph_height - stackedSankeyGraph_margin.top) - stackedSankeyGraph_margin.bottom;

const stackedSankey_offsetY = nav_offset_Y + stackedSankeyGraph_height;

const traitSelectionBox_width = content_width;
const traitSelectionBox_height = 230;
const traitSelectionBox_margin = { top: 0, right: 100, bottom: 0, left: 100 };
const traitSelectionBox_marginnedWidth = (content_width - traitSelectionBox_margin.right)-traitSelectionBox_margin.left;

const traitSelection_offsetY = nav_offset_Y + stackedSankeyGraph_height + traitSelectionBox_height

const clustering_width = content_width;
const clustering_height = 800;
const clustering_margin = { top: 50, right: 50, bottom: 0, left: 50};
const clustering_marginnedWidth = (content_width - clustering_margin.right)-clustering_margin.left;
const clustering_marginnedHeight = (clustering_height-clustering_margin.top)-clustering_margin.bottom;

const linkageMap_width = content_width;
const linkageMap_height = 550;
const linkageMap_margin = { top: 0, right: 50, bottom: 0, left: 50};
const linkageMap_marginnedWidth = (content_width - linkageMap_margin.right)-linkageMap_margin.left;

const time_width = content_width;
const time_height = 650;
const time_margin = { top: 100, right: 100, bottom: 100, left: 100};
const time_marginnedWidth = (content_width - time_margin.right)-time_margin.left;
const time_marginnedHeight = (time_height - time_margin.top)-time_margin.bottom;

let add_instruction = null;
let reset_instructions = null;
let add_commentary = null;
let reset_commentary = null;
let navigateTo = null;
let showDataSize = null;


const permittedTraitColours = [
	d3.rgb(31,119,180),
	d3.rgb(174,199,232),
	d3.rgb(255,127,14),
	d3.rgb(44,160,44),
	d3.rgb(152,223,138),
	d3.rgb(214,39,40),
	d3.rgb(255,152,150),
	d3.rgb(148,103,189),
	d3.rgb(197,176,213),
	d3.rgb(196,156,148),
	d3.rgb(227,119,194),
	d3.rgb(247,182,210),
	d3.rgb(127,127,127),
	d3.rgb(199,199,199),
	d3.rgb(188,189,34),
	d3.rgb(219,219,141),
	d3.rgb(23,190,207),
	d3.rgb(158,218,229)
];

let drag_obj_clickOffsetX = 0;
let drag_obj_clickOffsetY = 0;
let dragHandler = d3.drag()
	.on("start", function() {
		var current = d3.select(this);
		let transform = current.attr("transform").split("(");

		let click_objStartX = transform[1].split(",")[0];
		let click_objStartY = transform[1].split(",")[1].split(")")[0];
		drag_obj_clickOffsetX = click_objStartX - d3.event.x;
		drag_obj_clickOffsetY = click_objStartY - d3.event.y;
	})
    .on("drag", function () {
    	let newX = d3.event.x + drag_obj_clickOffsetX;
    	let newY = d3.event.y + drag_obj_clickOffsetY;
        d3.select(this)
			.attr("transform", "translate(" + newX + ", " + newY + ")");
    })
    .on("end", function() {
    	console.log("Checking Clustering");
    	// clustering_checkCompletion();
    });

const stackedBar_colours = [d3.rgb(120,60,0), d3.rgb(255,190,100, 0.8)]; //brown, peach

const lightFillColour = d3.rgb(235,235,235);
let failureFillColour = d3.rgb(255, 150, 150)
let noFailureFillColour = d3.rgb(255, 255, 255);
let successFillColour = d3.rgb(150, 255, 150);
let borderColour = d3.rgb(50,50,50);



let  traitColorer = d3.scaleOrdinal()
	.range(permittedTraitColours); 

let rawLinkageData = null;
let descriptionData = null;
let crossoverData = null;
let linkageMapData = null;
let linkageMap_chromosome_indices = null;
let mutation_time_data = null;
let importantEvents_data = null;

let max_crossover_value = 0;
let overall_pea_count = 0;
let unlinked_morganDistance_SD = 0;

const navigationOptions = ["Coupling", "Repulsion", "Clustering", "LinkageMap", "Time"];

let navigationSelection = "Coupling"; //global var storing current navigation status

let resetStage_instrs = [];
let setupStage_instrs = {};

let traits = [];
let trait_visibleCodes = [];

const transitionDuration = 500;

let smallMultiplePositionsCached = false;
let smallMultiplePositions = {};

let showDataSize_bool = false;

//method adapted (and (mostly) FIXED)
// from https://bl.ocks.org/mbostock/7555321
let wrap_text = function(text, width) {
	  text.each(function() {
	    var text = d3.select(this),
	        words = text.text().split(/\s+/).reverse(),
	        word,
	        line = [],
	        lineNumber = 0,
	        lineHeight = 1.1, // ems
	        y = text.attr("y"),
	        dy = parseFloat(text.attr("dy")),
	        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
	    while (word = words.pop()) {
	      line.push(word);
	      tspan.text(line.join(" "));
	      if (tspan.node().getComputedTextLength() > width) {
	        line.pop();
	        tspan.text(line.join(" "));
	        line = [word];
	        tspan = text.append("tspan").attr("x", 0).attr("y", ++lineNumber * lineHeight + y + "em").attr("dy", dy + "em").text(word);
	      }
	    }
	  });
	}

function getClassNameFromDescription(description) {
	let temp = description.replace(/ /g,"");
	temp = temp.replace(/#/,"No")
	return temp;
}
function bool_sum_list(list, bool_list) {
	let bool_sum = 0;
	list.forEach(function(value, i) {
		if (bool_list[i]) {
			bool_sum += value;
		}
	});
	return bool_sum;
}

//approximation discussed as the best on all three metrics looked at,
// in https://www.genetics.org/content/genetics/15/1/81.full.pdf
function computeMorganDistance_internal(list) {	
	//ANS = ad/bc ([a] * [d]  )/(  [b]  *  [c]  )
	if (list[3] == 0) {
		// console.log("list was : " + list);
		// console.log("modifying slightly to avoid zero error,");
		list[3]+=1;
		// console.log("New list: " + list);
	}
	let ans = (list[0]*list[3])/(list[1]*list[2]);
	// console.log("ANS is " + ans);
	//ANS = p^2(2+p^2) / (p^4 - 2p^2 + 1)
	//so: ANSp^4 - 2ANSp^2 + ANS = p^4 + 2p^2
	//so: (1-ANS)p^4 + (2+2ANS)p^2 - ANS = 0
	// p^2 = (((-b+/-(root(b^2-4ac) ))) / 2a
	// p^ 2 = ([-2-2ANS] +/- root([POW(2+2ANS, 2) - 4 * (1-ANS) * -ANS]) ) / (2-2ANS)
	// p^2 =    [(-2-2*ANS)   +/-    root( [   POW(2+2*ANS, 2) - 4*     POW(ANS, 2) + 4*ANS)]) / (2-2ANS)
	p_pow2_plus = ((-2-2*ans) + Math.sqrt(Math.pow(2+2*ans, 2) - 4*Math.pow(ans, 2) + 4*ans)) / (2-2*ans)
	p_pow2_minus = ((-2-2*ans) - Math.sqrt(Math.pow(2+2*ans, 2) - 4*Math.pow(ans, 2) + 4*ans)) / (2-2*ans)

	if (p_pow2_plus > 0 && p_pow2_plus < 1) {
		//use p_pow2_plus
		return Math.sqrt(p_pow2_plus);
	}
	else if (p_pow2_minus > 0 && p_pow2_minus < 1) {
		return Math.sqrt(p_pow2_minus);
	}
	else {
		console.log("SHOULD NOT HAVE REACHED HERE");
		return 0.5;
	}


}

//combine coupling and repulsion via weighted sum of computed morgan distance.
function computeMorganDistance(listCoupling, listRepulsion) {
	let couplingSum = d3.sum(listCoupling);
	let repulsionSum = d3.sum(listRepulsion);
	let morganDistance_coupling = 0;
	let morganDistance_repulsion = 0;
	if (couplingSum == 0) {
		morganDistance_coupling = 0;
	}
	else {
		morganDistance_coupling = 1-(computeMorganDistance_internal(listCoupling));
	}
	if (repulsionSum == 0) {
		morganDistance_repulsion = 0;
	}
	else {
		morganDistance_repulsion = computeMorganDistance_internal(listRepulsion);
	}

	let totalSum = couplingSum + repulsionSum;
	let morganDistance = (couplingSum * morganDistance_coupling + repulsionSum * morganDistance_repulsion) / totalSum;
	return morganDistance;

}

//TODO
//Move Instructions into the RHS, with the text-write-up

//update instructions for tab1,2 to say to mouseover to view the Mendelian sim

//add movement to clustering graph (to avoid the appearance of y being an encoding of something)
//but that's a low priority


let constructLinkageData = function(selectedTraits, data, dataType) {
	dataType = dataType || navigationSelection;
	traitDP = {};
	traitDP["first_trait"] = selectedTraits[0];
	traitDP["second_trait"] = selectedTraits[1];
	orig_linkage_vals = data[selectedTraits[0]][selectedTraits[1]][dataType]
	if (selectedTraits[0] < selectedTraits[1]) {
		//the order of entry of the data is correct
		traitDP["linkage_data"] = orig_linkage_vals
	}
	else {
		//the order of the middle two entries in the list (length 4) needs to be switched.
		traitDP["linkage_data"] = [orig_linkage_vals[0], orig_linkage_vals[2], orig_linkage_vals[1], orig_linkage_vals[3]];
	}
	sumTotal = d3.sum(orig_linkage_vals);
	independent_ratio = [9,3,3,1];
	independent_denom = 16;
	traitDP["independent_model_data"] = independent_ratio.map(function(numerator) {
		return numerator * sumTotal / independent_denom;
	});
	traitDP["cumul_start_vals"] = constructCumulativeStartList(traitDP["linkage_data"]);
	traitDP["independent_model_cumul_start_vals"] = constructCumulativeStartList(traitDP["independent_model_data"])
	traitDP["normalised_start_vals"] = normaliseValues(traitDP["cumul_start_vals"], sumTotal);
	traitDP["normalised_data"] = normaliseValues(traitDP["linkage_data"],sumTotal);
	// computeMorganDistance(data[selectedTraits[0]][selectedTraits[1]]["Coupling"], data[selectedTraits[0]][selectedTraits[1]]["Repulsion"])
	return traitDP;
}

let linkageDataExists = function(trait1, trait2, mode=navigationSelection) {
	if (trait1 === trait2) {
		return false;
	}
	if (d3.sum(rawLinkageData[trait1][trait2][mode]) > 0) {
		return true;
	}
	return false;
}

let normaliseValues = function(list, sum) {
	if (sum == 0) {
		return list;
	}
	else {
		return list.map(function(value) {
			return value/sum;
		});
	}	
}

let constructCumulativeStartList = function(list) {
	return list.map(function(value, index) {
		let cum_total = 0;
		for (let i = 0; i < index; i++) {
			cum_total += list[i];
		}
		return cum_total;
	});
}

let setupSVG = function() {
	let svg = d3.select("body").append("svg")
		.attr("transform", "translate(0,0)");
	svg.attr("width", overall_width);
	svg.attr("height", overall_height);
	return svg;
}

let setupNavigationBarGroup = function(svg) {
	let navBarGroup = svg.append("g")
		.attr("class", "NavigationBarOuter")
	navBarGroup.attr("width", navigationBar_width)
		.attr("height", navigationBar_height);

	let innerNavBarGroup = svg.append("g")
		.attr("class", "navigationBar")
		.attr("transform", "translate(" + navigationBar_margin.left + "," +  navigationBar_margin.top + ")");

	return innerNavBarGroup;
}

let setupInstructionGroup = function(svg) {
	//setup the instruction group.
	instructionGroupOuter = svg.append("g")
		.attr("transform", "translate(" + content_width + ", " + 0 + ")")
		.attr("width", instruction_width)
		.attr("height", instruction_height);

	instructionGroupInner = instructionGroupOuter.append("g")
		.attr("class", "commentaryBar")
		.attr("transform", "translate(" + instruction_margin.left + ", " + instruction_margin.top + ")");

	let instr_height = instruction_marginnedHeight/3;
	instructionGroupInner.append("rect")
		.attr("class", "instruction_rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", instruction_marginnedWidth)
		.attr("height", instr_height)
		.attr("stroke", borderColour)
		.style("fill", lightFillColour);

	let titleY = 40;

	instructionGroupInner.append("text")
		.attr("transform", "translate(" + (instruction_marginnedWidth/2) + ", " + titleY + ")")
		.text("Interaction Instructions")
		.style("font", "20px times")
		.style("text-decoration", "underline")
		.attr("text-anchor", "middle");

	let commentary_height = instruction_marginnedHeight * (2/3);
	instructionGroupInner.append("rect")
		.attr("class", "commentary_rect")
		.attr("x", 0)
		.attr("y", instr_height)
		.attr("width", instruction_marginnedWidth)
		.attr("height", commentary_height)
		.attr("stroke", borderColour)
		.style("fill", lightFillColour);

	instructionGroupInner.append("text")
		.attr("transform", "translate(" + (instruction_marginnedWidth/2) + ", " + (instr_height+titleY) + ")")
		.text("Content Commentary")
		.style("font", "20px times")
		.style("text-decoration", "underline")
		.attr("text-anchor", "middle");

	

	let firstEleOffset = titleY*2
	let firstInstrOffset = titleY*2;
	let firstCmntOffset = instr_height + (titleY*2);
	let instruction_count = 0;
	let commentary_count = 0;

	let max_instructions = 3;
	let yPerInstruction = (instr_height-firstEleOffset) / (max_instructions);
	let max_commentaries = 5;
	let yPerCommentary = (commentary_height-firstEleOffset)/(max_commentaries);

	let storedCommentaries = [];
	let storedFunctions = [];
	add_instruction = function(text) {
		let x_border = 40;
		let instr_x = 40;
		let instr_y = firstInstrOffset + (instruction_count) * yPerInstruction;
		let instrGroup = instructionGroupInner.append("g")
			.attr("class", "instruction")
			.attr("transform", "translate(" + instr_x + ", " + instr_y + ")");
		let new_instruction = instrGroup.append("text")
			.attr("class", "instruction_text")
			.style("font", "15px times")
			.attr("dy", 0)
			.text(text);

		instrGroup.append("circle")
			.attr("cx", (-20))
			.attr("cy", (-5))
			.attr("r", 5)
			.style("fill", d3.rgb(0,0,0));
		instruction_count++;
		new_instruction.call(wrap_text, instruction_marginnedWidth-(2*x_border));
	}

	reset_instructions = function() {
		d3.selectAll(".instruction").remove();
		instruction_count = 0;
	}

	add_commentary = function(text, fn=false) {
		console.log("fn is " + fn);
		if (commentary_count == max_commentaries){
			storedCommentaries.push(text);
			storedFunctions.push(fn);
			return;
		}
		let x_border = 40;
		let cmnt_x = 40;
		let cmnt_y = firstCmntOffset + (commentary_count) * yPerCommentary;
		let commentaryGroup = instructionGroupInner.append("g")
			.attr("class", "commentary")
			.attr("transform", "translate(" + cmnt_x + ", " + cmnt_y + ")");
		if (fn) {
			let failureCount = 0;
			let clickFunction = function() {
				if (fn()) {
					//success:
					d3.selectAll(".successIndicator").style("fill", successFillColour);
					// d3.select(d3This).style("fill", successFillColour);
					// d3.select(d3This).style("fill", noFailureFillColour)
					// .transition().duration(transitionDuration);
					d3.selectAll(".successIndicator").remove();
					d3.selectAll(".functionText").remove();
					add_commentary("Next to continue");
				}
				else {
					failureCount++;
					d3.select(".successIndicator").style("fill", failureFillColour);
					if (failureCount >= 3) {
						d3.selectAll(".functionText")
							.text("Aim for 7 groups, of any size");
					}
				}
			}			
			commentaryGroup.append("rect")
				.attr("class", "successIndicator")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", 220)
				.attr("height", titleY)
				.attr("stroke", d3.rgb(0,0,0))
				.style("fill", noFailureFillColour)
				.on("click", function() {
					clickFunction();	
				})
				.on("mouseover", function() {
					d3.select(this).style("cursor", "pointer");
				})
				.on("mouseout", function() {
					d3.select(this).style("cursor", "default");
				});
			commentaryGroup.append("text")
				.attr("class", "functionText")
				.attr("transform", "translate(15,25)")
				.text(text)
				.on("click", function() {
					clickFunction();
				})
				.on("mouseover", function() {
					d3.select(this).style("cursor", "pointer");
				})
				.on("mouseout", function() {
					d3.select(this).style("cursor", "default");
				});
				return;
			}
			else {
				console.log("function false");
				console.log("fn is " + fn);
			}
		
		let new_commentary = commentaryGroup.append("text")
			.attr("class", "instruction_text")
			.style("font", "15px times")
			.attr("dy", 0)
			.text(text);

		commentaryGroup.append("circle")
			.attr("cx", (-20))
			.attr("cy", (-5))
			.attr("r", 5)
			.style("fill", d3.rgb(0,0,0));
		commentary_count++;
		new_commentary.call(wrap_text, instruction_marginnedWidth-(2*x_border));
	}

	reset_commentary = function() {
		d3.selectAll(".commentary").remove();
		commentary_count = 0;
		storedCommentaries = [];
		storedFunctions = [];
	}

	let restart_commentary = function() {
		console.log("commentary restarting");
		reset_commentary();
		console.log("so, now calling getCommentary()");
		getCommentary();
	}

	let on_click_commentary = function() {
		if (storedCommentaries.length == 0) {
			reset_commentary();
			navigateOn();
			return;
		}
		d3.selectAll(".commentary").remove();
		commentary_count = 0;
		for (let i = 0; i < max_commentaries; i++) {
			//will all be accepted, so won't modify storedCommentaries
			add_commentary(storedCommentaries.shift(), storedFunctions.shift());
		}


	}

	resetStage_instrs.push(reset_instructions);
	resetStage_instrs.push(reset_commentary);


	nextButton = instructionGroupInner.append("g")
		.attr("transform", "translate(" + (20) + ", " + 
			(instr_height+(titleY/2)) + ")");

	nextButton.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", 80)
		.attr("height", titleY)
		.attr("stroke", d3.rgb(0,0,0))
		.style("fill", noFailureFillColour)
		.on("click", function() {
			console.log("I reckon that was just clicked");
			on_click_commentary();
		})
		.on("mouseover", function() {
			d3.select(this).style("cursor", "pointer");
		})
		.on("mouseout", function() {
			d3.select(this).style("cursor", "default");
		});
	nextButton.append("text")
		.attr("transform", "translate(15,25)")
		.text("Next")
		.on("click", function() {
			console.log("I reckon that was just clicked");
			on_click_commentary();
		})
		.on("mouseover", function() {
			d3.select(this).style("cursor", "pointer");
		})
		.on("mouseout", function() {
			d3.select(this).style("cursor", "default");
		});


	resetButton = instructionGroupInner.append("g")
		.attr("transform", "translate(" + (instruction_marginnedWidth-130) + 
			", " + (instr_height+(titleY/2)) + ")")

	resetButton.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", 120)
		.attr("height", titleY)
		.attr("stroke", d3.rgb(0,0,0))
		.style("fill", noFailureFillColour)
		.on("click", function() {
			console.log("I reckon that was just clicked");
			restart_commentary();
		})
		.on("mouseover", function() {
			d3.select(this).style("cursor", "pointer");
		})
		.on("mouseout", function() {
			d3.select(this).style("cursor", "default");
		});

	resetButton.append("text")
		.attr("transform", "translate(15,25)")
		.text("Restart Stage")
		.on("click", function() {
			console.log("I reckon that was just clicked");
			restart_commentary();
		})
		.on("mouseover", function() {
			d3.select(this).style("cursor", "pointer");
		})
		.on("mouseout", function() {
			d3.select(this).style("cursor", "default");
		});
	return instructionGroupInner;
}



let setupStackedBarGroup = function(svg) {
	let stackedBarOverallGroup = svg.append("g")
		.attr("transform", "translate(" + 0 + ", " + nav_offset_Y + ")")
		.attr("width", stackedSankeyGraph_width)
		.attr("height", stackedSankeyGraph_height);
	
	let stackedBarGroup = stackedBarOverallGroup.append("g")
		.attr("transform", "translate(" + stackedSankeyGraph_margin.left + "," + stackedSankeyGraph_margin.top + ")")

	let removeStackedBarGroup = function() {
		stackedBarOverallGroup.remove();
	}
	resetStage_instrs.push(removeStackedBarGroup);
	return stackedBarGroup;
}

let setupTraitSelectionGroup = function(svg) {

	let traitSelection_outer = svg.append("g") 
		.attr("transform", "translate(0," + stackedSankey_offsetY + ")")
		.attr("width", traitSelectionBox_width)
		.attr("height", traitSelectionBox_height);

	let traitSelection_group = traitSelection_outer.append("g")
		.attr("transform", "translate(" + traitSelectionBox_margin.left + "," + traitSelectionBox_margin.top + ")");

	let removeTraitSelectionGroup = function() {
		traitSelection_outer.remove();
	}
	resetStage_instrs.push(removeTraitSelectionGroup);

	return traitSelection_group;
}

let updateTraitComparisonBars = function(selectedTraits, stackedBarGroup) {
	if (selectedTraits.length < 2) {
		stackedBarGroup.selectAll(".gen2",".stackLayer").remove();
		stackedBarGroup.selectAll(".gen0sim_0",".stackLayer").remove();
		stackedBarGroup.selectAll(".gen0sim_1",".stackLayer").remove();
		stackedBarGroup.selectAll(".gen1sim",".stackLayer").remove();
		stackedBarGroup.selectAll(".mendelsim",".stackLayer").remove();
		stackedBarGroup.selectAll(".generationLabel").remove();
		stackedBarGroup.selectAll(".yAxis_phenotype_proportion").remove();
		stackedBarGroup.selectAll(".stackedBarSankeyTitle").remove();

		stackedBarGroup.selectAll(".legend").remove()
		return;
	}
	else if (selectedTraits.length == 2) {

		drawSelectedTraitStackedBars(selectedTraits, stackedBarGroup);
		console.log("Updated the stacked bar chart");
	}
}

/*let getLayerTextures = function() {
	let orientations = ["1/8", "3/8", "5/8", "7/8"]
	let sizes = [1, 10]
	let strokeWidth = 2;

	layerTextures = traits.map(function(d, i) {
		if (i <= traits.length/2) {
			let texture = textures.lines().
		}
	})
}*/

let colorizeTexture = function(texture, colour) {
	var tex = texture.stroke(colour);
	if (tex.fill) {
		tex = tex.fill(colour);
	}
	return texture;
}

let get_stackedChart_colourTextures = function(colours, textureGenerators, svg) {


	//colourer = d3.scaleOrdinal(d3.schemeCategory10);

	colourScale = d3.scaleOrdinal().domain(["dom", "rec"]).range(colours);
	textureScale = d3.scaleOrdinal().domain(["dom", "rec"]).range(textureGenerators);

	colourTextureScale = d3.scaleOrdinal()
		.domain(colourScale.domain())
		.range(colourScale.range().map(function(colour) {
			return d3.scaleOrdinal()
				.domain(textureScale.domain())
				.range(textureScale.range().map(function(textureGenerator) {
					return colorizeTexture(textureGenerator(), colour);
				}));
		}));

	colourTextureScale.range().forEach(function(textureScale) {
		textureScale.range().forEach(svg.call, svg);
	});

	return colourTextureScale;
}

let addStackedBarsLegend = function(selectedTraits, colours, textureGenerators, svgGroup) {


	legendIcon_instrs = []

	let textures = textureGenerators.map(function(tg) {
		return tg();
	});

	textures.forEach(function(t) {
		t = colorizeTexture(t, d3.rgb(50,50,50));
		svgGroup.call(t);
	});

	//non-iterable, so expressed each of the four extensions fully:
	let firstTrait_dom_instrs = function(legendItem) {
		trait = selectedTraits[0];
		legendItem.append("line")
			.attr("x1", 10)
			.attr("x2", 40)
			.attr("y1", 15)
			.attr("y2", 15)
			.attr("stroke-width", 5)
			.style("stroke", colours[0]);

		legendItem.append("text")
			.attr("transform", "translate(50, 20)")
			.text(descriptionData[trait]["Short_Dom"]);

		legendItem.append("rect")
			.attr("transform", "translate(165, 5)")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", 10)
			.attr("height", 60)
			.attr("fill", traitColorer(trait));
	};

	let firstTrait_rec_instrs = function(legendItem) {
		trait = selectedTraits[0];
		legendItem.append("line")
			.attr("x1", 10)
			.attr("x2", 40)
			.attr("y1", 15)
			.attr("y2", 15)
			.attr("stroke-width", 5)
			.style("stroke", colours[1]);

		legendItem.append("text")
			.attr("transform", "translate(50, 20)")
			.text(descriptionData[trait]["Short_Rec"]);
	};

	let secondTrait_dom_instrs = function(legendItem) {
		trait = selectedTraits[1];
		legendItem.append("rect")
			.attr("x", 40)
			.attr("y", 5)
			.attr("width", 30)
			.attr("height", 30)
			.style("fill", textures[0].url());

		legendItem.append("text")
		.attr("transform", "translate(80, 20)")
			.text(descriptionData[trait]["Short_Dom"]);

		legendItem.append("rect")
			.attr("transform", "translate(0, 5)")
			.attr("x", 10)
			.attr("y", 0)
			.attr("width", 10)
			.attr("height", 60)
			.attr("fill", traitColorer(trait));
	};

	let secondTrait_rec_instrs = function(legendItem) {
		trait = selectedTraits[1];
		legendItem.append("rect")
			.attr("x", 40)
			.attr("y", 5)
			.attr("width", 30)
			.attr("height", 30)
			.style("fill", textures[1].url());

		legendItem.append("text")
		.attr("transform", "translate(80, 20)")
			.text(descriptionData[trait]["Short_Rec"]);
	};

	legendIcon_instrs.push(firstTrait_dom_instrs);
	legendIcon_instrs.push(firstTrait_rec_instrs);
	legendIcon_instrs.push(secondTrait_dom_instrs);
	legendIcon_instrs.push(secondTrait_rec_instrs);

	/*
	First_Trait is COLOUR: 
		DOM - Brown
		REC - Peach
	Second_Trait is TEXTURE:
		DOM - Fill
		REC - Hashed
	*/

	
	let legend_width = 380;
	let legend_height = 75;

	let legendGroup = svgGroup.append("g")
		.attr("class", "legend")
		.attr("transform", "translate( " + 
			(stackedSankey_marginnedWidth-legend_width)/2 + ", 0)"); //center top

	//set up borders
	legendGroup.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", legend_width)
		.attr("height", legend_height)
		.attr("fill", lightFillColour)
		.attr("stroke", borderColour);

	var legendItems = legendGroup.selectAll(".legendItem")
		.data(legendIcon_instrs)
		.enter()
		.append("g")
			.attr("class", "legendItem")
			.attr("transform", function(d, i) {
				let x = 0;
				if (i / 2 < 1) {
					//first trait
					x = 0;
				}
				else {
					x = 180;
				}
				let y = (i%2)*35;
				return "translate(" + x + ", " + y + ")";
			})
			.each(function(d) {
				d(d3.select(this));
			});
	
	legendGroup.append("line")
		.attr("x1", 182.5)
		.attr("x2", 182.5)
		.attr("y1", 0)
		.attr("y2", 75)
		.attr("stroke-width", 2)
		.style("stroke", borderColour);

	return legendGroup;
}


let drawSelectedTraitStackedBars = function(selectedTraits, svgGroup) {
	let linkageData = [];
	linkageData.push(constructLinkageData(selectedTraits, rawLinkageData));

	heightRange = [0,1]//d3.extent(barHeightValues);

	let x = d3.scaleBand()
		.domain([0,1,2,3]) //gen0, gen1, gen2, mendel_comparison
		.range([0, stackedSankey_marginnedWidth] )
		.padding(0.3); //the amount of space between each bar

	let y = d3.scaleLinear()
		.domain(heightRange)
		.range([0, stackedSankey_marginnedHeight-100]);

	indexRange = [0,1,2,3]; //the indexes for linkage count data

	let dataIntermediate = indexRange.map(function(valueIndex, i) {
		return linkageData.map(function(trait) {
			return {
				first_trait: trait["first_trait"],
				second_trait: trait["second_trait"],
				cumul_start_val: trait["cumul_start_vals"][valueIndex],
				orig_value: trait["linkage_data"][valueIndex],

				normalised_cumul_start_val: trait["normalised_start_vals"][valueIndex],
				normalised_value: trait["normalised_data"][valueIndex]
				//eventually will want the scaled 9:3:3:1 value here as well.
			};
		});
	});

	let gen0_sim0_data = [];
	let gen0_sim1_data = [];

	if (navigationSelection === "Coupling") {
		gen0_sim0_data = [100,0,0,0];
		gen0_sim1_data = [0,0,0,100];
	}
	else if (navigationSelection === "Repulsion") {
		gen0_sim0_data = [0, 100, 0, 0];
		gen0_sim1_data = [0, 0, 100, 0];
	}
	let gen1_sim_data = [100,0,0,0];

	let mendelsim_data = [9,3,3,1];
	
	let format_sim_data = function(gen2_data, simData) {

		simDataSum = d3.sum(simData);

		sim_normalised_cumul_start_vals = normaliseValues(constructCumulativeStartList(simData), simDataSum);
		sim_normalised_values = normaliseValues(simData, simDataSum);

		return gen2_data.map(function(g2, i) {

			return [{
				first_trait: g2[0]["first_trait"],
				second_trait: g2[0]["second_trait"],
				normalised_cumul_start_val: sim_normalised_cumul_start_vals[i],
				normalised_value: sim_normalised_values[i]
			}]
		});
	}



	let gen0sim0_intermediate = format_sim_data(dataIntermediate, gen0_sim0_data);
	//console.log("dataIntermediate:")
	//console.log(dataIntermediate);
	let gen0sim1_intermediate = format_sim_data(dataIntermediate, gen0_sim1_data);
	let gen1sim_intermediate = format_sim_data(dataIntermediate, gen1_sim_data);

	let mendelsim_intermediate = format_sim_data(dataIntermediate, mendelsim_data);


	let textureGenerators = [
		function() { return textures.circles().size(3) }, //same as FILL
		function() { return textures.lines().orientation("1/8", "4/8", "3/8").thicker() }
	];
	//colours are already created, in stackedBar_colours global var

	let colourTextureScale = get_stackedChart_colourTextures(stackedBar_colours, textureGenerators, svgGroup);

	let legendGroup = addStackedBarsLegend(selectedTraits, stackedBar_colours, textureGenerators, svgGroup);

	let get_fill = function(d, i) {
		if (i / 2 < 1) {
			return colourTextureScale(d[0].first_trait)(i%2).url();
		}
		else {
			return colourTextureScale(d[0].second_trait)(i%2).url();
		}
	}

	let title = svgGroup.append("text")
		.attr("class", "stackedBarSankeyTitle")
		.attr("transform", "translate(" + (stackedSankey_marginnedWidth/2) +
			", " + (-30) + ")")
		.style("text-anchor", "middle")
		.style("font", "20px times")
		.style("text-decoration", "underline")
		.text(navigationSelection + "- Physical Traits Across Generations, in the Sweet Pea")

	let stackArea = svgGroup.append("g")
		.attr("transform", "translate(0,100)");


	let gen0_sim0_stackLayers = stackArea.selectAll(".gen0sim_0",".stackLayer")
		.data(gen0sim0_intermediate)
		.enter()
		.append("g")
			.attr("class", "gen0sim_0 stackLayer")
			.style("fill", function(d, i) {
				return get_fill(d, i)
			});
	gen0_sim0_stackLayers.selectAll("rect")
		.data(function(d) { return d;})
		.enter()
		.append("rect")
			.attr("x", function(d) {
				return x(0);
			})
			.attr("y", function(d) {
				return y(d["normalised_cumul_start_val"]*0.5);
			})
			.attr("height", function(d) {
				return y(d["normalised_value"]*0.5);
			})
			.attr("width", x.bandwidth())
			.attr("stroke", "rgb(0, 0, 0")
			.attr("stroke-width", "1");

	let gen0_sim1_stackLayers = stackArea.selectAll(".gen0sim_1",".stackLayer")
		.data(gen0sim1_intermediate)
		.enter()
		.append("g")
			.attr("class", "gen0sim_1 stackLayer")
			.style("fill", function(d, i) {
				return get_fill(d, i)
			});
	gen0_sim1_stackLayers.selectAll("rect")
		.data(function(d) { return d;})
		.enter()
		.append("rect")
			.attr("x", function(d) {
				return x(0);
			})
			.attr("y", function(d) {
				return y(0.5)+(y(d["normalised_cumul_start_val"]*0.5));
			})
			.attr("height", function(d) {
				return y(d["normalised_value"]*0.5);
			})
			.attr("width", x.bandwidth())
			.attr("stroke", "rgb(0, 0, 0")
			.attr("stroke-width", "1");

	let gen1sim_stackLayers = stackArea.selectAll(".gen1sim",".stackLayer")
		.data(gen1sim_intermediate)
		.enter()
		.append("g")
			.attr("class", "gen1sim stackLayer")
			.style("fill", function(d, i) {
				return get_fill(d, i)
			});
	gen1sim_stackLayers.selectAll("rect")
		.data(function(d) { return d;})
		.enter()
		.append("rect")
			.attr("x", function(d) {
				return x(1);
			})
			.attr("y", function(d) {
				return y(d["normalised_cumul_start_val"]);
			})
			.attr("height", function(d) {
				return y(d["normalised_value"]);
			})
			.attr("width", x.bandwidth())
			.attr("stroke", "rgb(0, 0, 0")
			.attr("stroke-width", "1");

	let mendelsim_stackLayers = stackArea.selectAll(".mendelsim", ".stackLayer")
		.data(mendelsim_intermediate)
		.enter()
		.append("g")
			.attr("class", "mendelsim stackLayer")
			.style("fill", function(d, i) {
				return get_fill(d, i)
			});
	mendelsim_stackLayers.selectAll("rect")
		.data(function(d) { return d;})
		.enter()
		.append("rect")
			.attr("x", function(d) {
				return x(3);
			})
			.attr("y", function(d) {
				return y(d["normalised_cumul_start_val"]);
			})
			.attr("height", function(d) {
				return y(d["normalised_value"]);
			})
			.attr("width", x.bandwidth())
			.attr("stroke", "rgb(0, 0, 0")
			.attr("stroke-width", "1");


	let gen2_stackLayers = stackArea.selectAll(".gen2",".stackLayer")
		.data(dataIntermediate)
		.enter()
		.append("g")
			.attr("class", "gen2 stackLayer")
			.style("fill", function(d, i) {
				return get_fill(d, i)
			})
			.on("mouseover", function() {
				show_mendelianInheritanceSBC(mendelsim_stackLayers, true);
			})
			.on("mouseout", function() {
				show_mendelianInheritanceSBC(mendelsim_stackLayers, false);
			});

	gen2_stackLayers.selectAll("rect")
		.data(function(d) { return d; })
		.enter()
		.append("rect")
			.attr("x", function(d) {
				return x(2);
			})
			.attr("y", function(d) {
				return y(d["normalised_cumul_start_val"]);
			})
			.attr("height", function(d) {
				return y(d["normalised_value"]);
			})
			.attr("width", x.bandwidth())
			.attr("stroke", "rgb(0, 0, 0")
			.attr("stroke-width", "1");
			

	genTitles = ["Generation 0 (sim)", "Generation 1 (sim)", "Generation 2 (Real)", "Mendelian Simulation"];

	let genLabels = stackArea.selectAll(".generationLabel")
		.data(genTitles)
		.enter()
			.append("g")
			.attr("class", function(d) {
				return "generationLabel " + d;
			})
			.attr("transform", function(d, i) {
				return "translate(" + x(i) + "," + (stackedSankey_marginnedHeight-70) + ")";
			})
			.append("text")
				.text(function(d) { return d;});

	let axisStartX = 0;
	let axisStartY = (stackedSankey_marginnedHeight-100)/2;
	let axis = svgGroup.append("g")
		.attr("class", "yAxis_phenotype_proportion axis")
		.attr("transform", "translate(" + axisStartX + ", " + axisStartY + ")")
		.call(d3.axisLeft(y))

	let axis_label = svgGroup.append("text")
		.attr("class", "yAxis_phenotype_proportion label")
		.attr("transform", "translate(" + (axisStartX-100) + ", " + (axisStartY-20) + ")")
		// .attr("transform", "rotate(-90," + axisStartX + ", " + axisStartY + ")")

		.text("Phenotype Proportion");
		// .attr("text-anchor", "middle")
		// .text("");

	show_mendelianInheritanceSBC(mendelsim_stackLayers, false)

	let clearTraitComparisonBars = function() {
		legendGroup.remove();
		stackArea.remove();
		axis.remove();
		axis_label.remove();
	}


	resetStage_instrs.push(clearTraitComparisonBars);

}

let navigateOn = function() {
	let currentIndex = navigationOptions.indexOf(navigationSelection);
	let new_index = 0;
	if (currentIndex == navigationOptions.length-1) {
		new_index = 0;
	}
	else {
		new_index = currentIndex +1;
	}
	navigateTo(navigationOptions[new_index]);

}

let getCommentary = function() {
	console.log("getCommentary called : " + navigationSelection);
	if (navigationSelection === "Coupling") {
		getCommentary_Coupling();
	}
	else if (navigationSelection === "Repulsion") {
		getCommentary_Repulsion();
	}
	else if (navigationSelection === "Clustering") {
		getCommentary_Clustering();
	}
	else if(navigationSelection === "LinkageMap") {
		getCommentary_LinkageMap();
	}
	else if(navigationSelection === "Time") {
		getCommentary_Time();
	}
}

let getInstructions = function() {
	if (navigationSelection === "Coupling") {
		getInstructions_Coupling();
	}
	else if (navigationSelection === "Repulsion") {
		getInstructions_Repulsion();
	}
	else if (navigationSelection === "Clustering") {
		getInstructions_Clustering();
	}
	else if(navigationSelection === "LinkageMap") {
		getInstructions_LinkageMap();
	}
	else if(navigationSelection === "Time") {
		getInstructions_Time();
	}
}

function getInstructionsTraitSelection() {
	add_instruction("Hover over the trait selection TABS to read descriptions of traits");
	add_instruction("Select (Click) on TWO traits tabs in the Trait Selection Window below the graph. Click to select, click again to deselect.");
	add_instruction("Hover over the Generation 2 chart to view comparison with Mendel's expectation");
}

function getInstructions_Coupling() {
	getInstructionsTraitSelection();
}

function getInstructions_Repulsion() {
	getInstructionsTraitSelection();
}

function getInstructions_Clustering() {
	add_instruction("Drag and drop boxes to form groups: Very low linkage means they are almost certainly grouped together! Make the boxes overlap");
	add_instruction("HINT: Try to find 7 groups, some groups will have only one member!");
	add_instruction("Make sure within a group all boxes overlap with all other boxes");
}

function getInstructions_LinkageMap() {
	add_instruction("Hover over any chromosome on the map to update the Legend");
	add_instruction("Click the Reveal button to continue the story");
}

function getInstructions_Time() {
	add_instruction("Hover over any of the coloured 'Event' circles to see the tooltip");
	add_instruction("You can navigate between the tabs at the top to revisit any of the other visualisations");
}

function getCommentary_Coupling() {
	add_commentary("In nature, animals and plants display certain physical characteristics: \"Traits\".");
	add_commentary("Mendel established in 1865 that traits are inherited in certain reliable patterns. Pairs of possible characteristics are never both displayed: it's one or the other.");
	add_commentary("A flower could be either Purple or Red. A petal could be shaped Erect or Hooded, but not both.");
	add_commentary("Mendel found that within these pairings, one trait always dominates the other, but not totally. He found that the dominant trait appeared 3 times as often. A 3:1 ratio.");
	add_commentary("You can see this still holds for both individual traits (see the legend above the chart) for 'Generation 2'. Click Next to continue");
	add_commentary("This can be taken further. What if you have two traits at the same time? Mendel calculated that if both independently follow a 3:1 ratio, the new ratio would be 9:3:3:1 across the two traits.");
	add_commentary("Take another look at that 'Generation 2' stacked bar chart in the graphic: what ratio do you see?")
	add_commentary("Hover over that 'Generation 2' bar chart to reveal the Mendelian simulation on the next plot - they're pretty close to identical.");
	add_commentary("But, what if this wasn't always true?");
	add_commentary("Click Next to continue");
	add_commentary("Try playing with the trait selection tabs below the charts to modify the comparison.");
	add_commentary("Does this 9:3:3:1 ratio always hold? Mendel thought it did, but we have more data now than he did. Keep looking for a while and you'll find something.");
	add_commentary("\"Coupling\": in 1906, 6 years after the infamous late rediscovery of Mendel's 1865 work, Bateson and Punnett made the same discovery you just made, with data from the very same sweet peas.")
	add_commentary("They proposed that 'Coupling' was the cause. Dominant traits sometimes 'couple' together. Their non-dominant partners: ('recessives') sometimes 'couple' together. When coupled, they inherit together more often than Mendel would have predicted.");
	add_commentary("They tested this using a different type of breeding: 'Repulsion'. Click Next now to move on (you can navigate back later)");
}

function getCommentary_Repulsion() {
	add_commentary("In Repulsion, the subtle difference is in the make-up of Generation 0. Go back and check if you need to (you can navigate at the top).");
	add_commentary("Both Coupling and Repulsion have a homogenous, dominant-only, Generation 1, but they have entirely different traits in generation 0.");
	add_commentary("If dominant traits could 'couple', and recessive traits could 'couple', we expect to see similar results to last time - if not, maybe something else?");
	add_commentary("See if you can find any non-Mendelian patterns. [These are a bit subtler than last time].");
	add_commentary("Next to continue.");
	add_commentary("At this stage, Punnett and Bateson came up with a secondary theory: Repulsion theory. In some cases, dominant traits will 'couple', and in other cases, they will 'repulse' each other.");
	add_commentary("This is a plausible explanation: it doesn't sidestep any of the evidence, but it wasn't sufficient for anyone");
	add_commentary("In 1911, Bateson put forward his expanded theory: of 'Reduplication': In its simplest form we could think of traits like a mixed bacterial culture: they grow at different rates in different environments - and so some traits exceed alongside others, or fail with certain others.");
	add_commentary("In 1911, Thomas Hunt Morgan, working with his own data from breeding fruit flies, also put forward his own theory: The Chromosome as a cause for Genetic Linkage");
	add_commentary("Next to continue");
}

function getCommentary_Clustering() {
	add_commentary("The origins of this idea had roots in cell biology, with the theoretical 'Chromosome' structure. This seemed like a very convenient vehicle through which genetic linkage could occur.")
	add_commentary("Morgan observed that 'linked' traits were often in groups larger than just two.");
	add_commentary("And further, he observed that this 'linkage' was always favouring the exact trait combinations of the grandparents.");
	add_commentary("In Coupling, we saw double-dominant and double-recessive traits being more numerous. In Repulsion we saw the mixed dominant-recessive pairs exceeding their expected frequencies.");
	add_commentary("In both cases, those combinations were the same inputs we had in 'Generation 0'. Next to continue");
	add_commentary("The explanation for this came with a mechanism called 'crossover'.");
	add_commentary("Conceptually, if traits were stored in groups, and groups were linked together, traits in different groups might be inherited independently, but in the case two traits are in the same group, they are more likely to stay together just the way they are.")
	add_commentary("As the saying goes, \"like peas in a pod\".");
	add_commentary("Have a go now at forming these groupings, using data calculated from the simple distributions we've already seen. Tighter grouping means low crossover.");
	add_commentary("Check Solution", clustering_checkCompletion);
}

function getCommentary_LinkageMap() {
	add_commentary("Congratulations! You've discovered the Chromosome. 110 years ago you could have been in contention for the Nobel Prize.");
	add_commentary("Alfred Sturtevant, a student of Thomas Morgan Hunt devised a new way of looking at this: A chromosome map.");
	add_commentary("Instead of a group, think of a chromosome as a line. Longer distances along this line represent increased chance of crossover. Close distances represent tight linkage.");
	add_commentary("Crossover then, is a physical relationship, that takes place on physical structures (chromosomes). Traits are linked physically - those closest together are linked more strongly.");
	add_commentary("The units on this graph are centiMorgans - 1 cM is the distance required for a 1% chance of crossover. Next to continue");
	add_commentary("There is masses of potential for techniques building on this, so where has the last 100 years gone? Have we established a moon colony for testing genetically enhanced humans?");
	add_commentary("Sadly, but also fortunately, no. Progress has been rapid in many ways, but not always in ways that are readily perceivable from outside the Genetics field.");
	add_commentary("One of the key limitations comes with data availability for study on human genetics. You can't breed humans in control environments. We had to develop new techniques.");
	add_commentary("Reveal", showDataSize);
}

function getCommentary_Time() {
	add_commentary("Interact with the data points on the graph to experience the full story.");
	add_commentary("In recent years, new developments have lead to an explosion in the possibilities offered by genetics - and this time quantity of data, and computation potential will not be lacking There will be human consequences.");
	add_commentary("Human medical applications of genetics are finally within reach. From isolating responsible genes, treating mutation-patients with gene-editing, to techniques developed from a better atomic understanding of the mechanisms of disease");
	add_commentary("The Human Genome project is thought to be the largest collaborative scientific project in history - and its success is perhaps starting to be realised across genetics, medicine, and the wider world.");
	add_commentary("Genesis to Genomics.");
}

let show_mendelianInheritanceSBC = function(stackLayers, showBool) {
	let newOpacity = showBool ? 1 : 0;
	stackLayers.style("opacity", newOpacity);
}

let getTraitSelectionColour = function(trait, selectedTraits, useDefault) {
	if (useDefault) {
		return traitColorer(trait);
	}
	let inactive_opacity = 0.15;
	if (selectedTraits.indexOf(trait) > -1) {
		return traitColorer(trait);
	}
	else if (selectedTraits.length == 1) {
		if (linkageDataExists(trait, selectedTraits[0])) {
			return traitColorer(trait);
		}
		else {
			col = d3.color(traitColorer(trait));
			col.opacity = inactive_opacity;
			return col;
		}
	}
	else if (selectedTraits.length == 0) {
		//all are visible
		return traitColorer(trait);
	}
	else {
		col = d3.color(traitColorer(trait));
		col.opacity = inactive_opacity;
		return col;
	}
}

let getTraitSelectionYValue = function(trait, selectedTraits, yScale, useDefault) {
	if (useDefault) {
		return yScale(0.25);
	}
	if (selectedTraits.indexOf(trait) > -1) {
		return yScale(0);
	}
	else if (selectedTraits.length == 1) {
		if (linkageDataExists(trait, selectedTraits[0])) {
			return yScale(0.25);
		}
		else {
			return yScale(0.5);
		}
	}
	else {
		return yScale (0.25);
	}
}

let drawTraitSelectionBox = function(selectedTraits, traitSelection_group, stackedBar_group) {

	descriptionsIntermediate = [];
	traits.forEach(function(t) {

		dp = {}
		dp.trait = t;
		dp.full_descr = descriptionData[t]["Full_Descr"];
		dp.short_dom = descriptionData[t]["Short_Dom"];
		dp.short_rec = descriptionData[t]["Short_Rec"];

		descriptionsIntermediate.push(dp);
	});

	let traitSelectionTitle_height = traitSelectionBox_height*0.08;
	let traitSelectionTabs_height = traitSelectionBox_height*0.52;
	let tempDisplay_height = traitSelectionBox_height*0.15;
	let selectedTraitIndicators_height = traitSelectionBox_height*0.25;
	let tempDisplay_width = 400;
	let xStart = (traitSelectionBox_marginnedWidth-tempDisplay_width)/2;

	let traitSelectionTitle_group = traitSelection_group.append("g")
		.attr("transform", "translate(0, 0)");

	

	traitSelectionTitle_group.append("rect")
		.attr("x", 0)
		.attr("y", -10)
		.attr("width", traitSelectionBox_marginnedWidth)
		.attr("height", traitSelectionTabs_height+traitSelectionTitle_height)
		.attr("stroke", borderColour)
		.style("fill", d3.rgb(255, 255, 255));

	traitSelectionTitle_group.append("text")
		.attr("transform", "translate(" + (traitSelectionBox_marginnedWidth/2) + 
			", " + 10 + ")")
		.text("Trait Selection")
		.style("text-decoration", "underline")
		.style("font", "20px times")
		.attr("text-anchor", "middle");


	let traitDescriptionTemp = traitSelection_group.append("g")
		.attr("transform", "translate(" + xStart + "," + (traitSelectionTabs_height+traitSelectionTitle_height) + ")")
		.attr("class", "hover_display traitDescription")

	traitDescriptionTemp.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", tempDisplay_width)
		.attr("height", tempDisplay_height)
		.attr("stroke", borderColour)
		.style("fill", lightFillColour);


	let changeTempDisplay = function(d) {
		traitDescriptionTemp.selectAll(".default_text").remove();
		traitDescriptionTemp.selectAll(".trait_rect .trait_text").remove(); //possible that it could skip mouseout
		traitDescriptionTemp.append("rect")
			.attr("class", "trait_rect")
			.attr("x", 10)
			.attr("y", 5)
			.attr("width", 10)
			.attr("height", 20)
			.style("fill", traitColorer(d["trait"]));

		traitDescriptionTemp.append("text")
			.attr("transform", "translate(40,20)")
			.attr("class", "trait_text")
			.text(d["full_descr"]);
	}

	let defaultTempDisplay = function() {
		d3.selectAll(".trait_rect").remove();
		d3.selectAll(".trait_text").remove(); 
		traitDescriptionTemp.append("text")
			.attr("transform", "translate(40, 20)")
			.attr("class", "default_text")
			.text("No trait targeted");
	}

	defaultTempDisplay();

	let selectedTraitsIndicators_group = traitSelection_group.append("g")
		.attr("transform", "translate(0," + 
			(traitSelectionTabs_height + tempDisplay_height+traitSelectionTitle_height) + ")");
	let selectedTraitIndicators = selectedTraitsIndicators_group.selectAll(".selectedTraitsIndicator")
		.data(selectedTraits)
		.enter()
		.append("g")
			.attr("class", "selectedTraitsIndicator")
			.attr("transform", "translate(100,0)");

	selectedTraitIndicators.append("rect")
		.attr("x", 0)
		.attr("y", function(d, i) {
			return (i*25);
		})
		.attr("width", 10)
		.attr("height", 20)
		.style("fill", function(d) {
			return traitColorer(d);
		});

	selectedTraitIndicators.append("text")
		.attr("transform", function(d, i) {
			return "translate(30, " + (15+(i*25)) + ")";
		})
		.text(function(d) {
			return descriptionData[d]["Full_Descr"];
		});
	
	let x = d3.scaleBand()
		.domain(traits)
		.range([0, traitSelectionBox_marginnedWidth])
		.padding(0.1); //the amount of space between each bar

	let y = d3.scaleLinear()
		.domain([0, 1])
		.range([0,traitSelectionTabs_height]);

		
	let traitSelectorsGroup = traitSelection_group.append("g")
		.attr("transform", "translate(0," + traitSelectionTitle_height + ")");
	let traitSelectors = traitSelectorsGroup.selectAll(".traitSelector")
		.data(descriptionsIntermediate)
		.enter()
		.append("g")
			.attr("class", "traitSelector")
			.style("fill", function(d, i) {
				return getTraitSelectionColour(d.trait, selectedTraits);
			});
			
	traitSelectors.append("rect")
		.attr("class", "traitSelectorIcon")
		.attr("x", function(d) {
			return x(d.trait)
		})
		.attr("y", function(d) {
			return (getTraitSelectionYValue(d.trait, selectedTraits, y));
		})
		.attr("height", function(d) {
			return y(0.5);
		})
		.attr("width", x.bandwidth())
		.on("click", function(d) {
			console.log("Clicked: " + d.full_descr);
			let f = selectedTraits;
			selectedTraits = onClick_updateTraitSelection(d, selectedTraits, traitSelection_group, y);

			updateTraitSelectionBox(selectedTraits, traitSelection_group, y);

			updateTraitComparisonBars(selectedTraits, stackedBar_group)
		})
		.on("mouseover", function(d) {
			d3.select(this).style("cursor", "pointer");
			changeTempDisplay(d);
		})
		.on("mouseout", function(d) {
			d3.select(this).style("cursor", "default");
			defaultTempDisplay();
		});



	let resetTraitSelection = function() {
		traitSelectors.style("fill", function(d) {
			return getTraitSelectionColour(d.trait, selectedTraits, true);
		});
		traitSelection_group.selectAll(".traitSelectorIcon")
		.attr("y", function(d) {
			return getTraitSelectionYValue(d.trait, selectedTraits, y, true);
		});

		selectedTraitIndicators.remove();
		selectedTraits = []
	}

	resetStage_instrs.push(resetTraitSelection);
}

let onClick_updateTraitSelection = function(d, selectedTraits, traitSelection_group, yScale) {
	selectedTraits_index = selectedTraits.indexOf(d.trait);
	if (selectedTraits_index > -1) {
		//this was previously selected. Deselect it.
		selectedTraits.splice(selectedTraits_index, 1);
	}
	else if (selectedTraits.length >= 2) {
		alert("MAX: two traits can be selected at a time.\n" + 
			"Click on a currently selected trait to remove it. Then add another.");
		return selectedTraits;
	}
	else if (selectedTraits.length == 1) {
		if (linkageDataExists(d.trait, selectedTraits[0])) {
			selectedTraits.push(d.trait);
		}
		else {
			return selectedTraits;
		}
	}
	else if (selectedTraits.length == 0) {
		selectedTraits.push(d.trait);
	}
	return selectedTraits;
}

let updateTraitSelectionBox = function(selectedTraits, traitSelection_group, yScale) {
	traitSelection_group.selectAll(".traitSelector")
	.transition().duration(transitionDuration)
	.style("fill", function(d) {
		col = getTraitSelectionColour(d.trait, selectedTraits);
		return col;
	});

	traitSelection_group.selectAll(".traitSelectorIcon")
	.transition().duration(transitionDuration)
	.attr("y", function(d) {
		return getTraitSelectionYValue(d.trait, selectedTraits, yScale);
	});
	traitSelection_group.selectAll(".selectedTraitsIndicator").remove();

	let selectedTraitIndicators = traitSelection_group.selectAll(".selectedTraitsIndicator")
		.data(selectedTraits)
		.enter()
		.append("g")
			.attr("class", "selectedTraitsIndicator")
			.attr("transform", "translate(100," + traitSelectionBox_height*0.85 + ")")

	selectedTraitIndicators.append("rect")
		.attr("x", 0)
		.attr("y", function(d, i) {
			return (i*25)-15;
		})
		.attr("width", 10)
		.attr("height", 20)
		.style("fill", function(d) {
			return traitColorer(d);
		});

	selectedTraitIndicators.append("text")
		.attr("transform", function(d, i) {
			return "translate(30, " + i*25 + ")";
		})
		.text(function(d) {
			return descriptionData[d]["Full_Descr"];
		});

}

let updateNavigation = function(optionClicked, prevSelection, navigationBarGroup) {
	if (optionClicked === prevSelection) {
		return prevSelection;
	}
	else {
		let newNavigationSelection = optionClicked;

		//change navBar colours
		navigationBarGroup.selectAll(".navigationButton")
		.transition().duration(transitionDuration)
		.style("fill", function(d) {
			return getNavigationOptionColour(d, newNavigationSelection);
		});
		//change the rest of the display
		resetStage_instrs.forEach(function(d) {
			d();
		});
		resetStage_instrs = [];
		resetStage_instrs.push(reset_instructions);
		resetStage_instrs.push(reset_commentary);

		navigationSelection = newNavigationSelection;
		setupStage_instrs[optionClicked]();
		getCommentary();
		getInstructions();

		//return new navigationSelection
		return newNavigationSelection;
	}
}

let getNavigationOptionColour = function(navOption, navigationSelection) {
	if (navOption === navigationSelection) {
		return	d3.color(d3.rgb(165, 0, 0));
	}
	else {
		return d3.color(d3.rgb(200,200,200));
	}
}

let setupNavigationBar = function(navigationBarGroup) {

	let x = d3.scaleBand()
		.domain(navigationOptions)
		//.domain([0, navigationOptions.length-1])
		.range([0, navigationBar_marginnedWidth])
		.padding(0.1); //the amount of space between each button

	let y = d3.scaleLinear()
		.domain([0, 1])
		.range([0,navigationBar_height]);

	let title = navigationBarGroup.append("text")
		.attr("transform", "translate(50,25)")
		.text("Navigation")
		.style("font", "20px times")
		.style("text-decoration", "underline")

	let navigationButtons = navigationBarGroup.selectAll(".navigationButton")
		.data(navigationOptions)
		.enter()
		.append("g")
		.attr("class", "navigationOption");


	navigationButtons.append("circle")
		.attr("class", "navigationButton")
		.style("fill", function(d, i) {
			return getNavigationOptionColour(d, navigationSelection);
		})
		.attr("cx", function(d, i) {
			return x(d);
		})
		.attr("cy", function(d) {
			return y(0.5);
		})
		.attr("r", function(d) {
			return y(0.25);
		})
		.on("click", function(d) {
			navigationSelection = updateNavigation(d, navigationSelection, navigationBarGroup);
		})
		.on("mouseover", function() {
			d3.select(this).style("cursor", "pointer");
		})
		.on("mouseout", function() {
			d3.select(this).style("cursor", "default");
		});


	navigateTo = function(d) {
		return updateNavigation(d, navigationSelection, navigationBarGroup);
	}
}


let setupClusteringGroup = function(svg) {
	let clusteringGroup_outer = svg.append("g")
		.attr("transform", "translate(0," + nav_offset_Y + ")")
		.attr("width", clustering_width)
		.attr("height", clustering_height);
	let clusteringGroup = clusteringGroup_outer.append("g")
		.attr("transform", "translate(" + clustering_margin.left + "," + clustering_margin.top + ")")
	clusteringGroup.append("rect")
		.attr("x", -clustering_margin.left)
		.attr("y", 0)
		.attr("width", clustering_width)
		.attr("height", clustering_marginnedHeight)
		.style("fill", d3.rgb(255, 255, 255))
		.attr("stroke", d3.rgb(150,150,150));
	let removeClusteringGroup = function() {
		clusteringGroup_outer.remove();
	}
	resetStage_instrs.push(removeClusteringGroup);
	return clusteringGroup;
}

let setupClusteringData = function() {
	overall_pea_count = 0;
	max_val = 0;
	let crossover_unlinked_values = []
	crossoverData = [];
	traits.forEach(function(t1, i1) {
		crossoverData.push([]);
		traits.forEach(function(t2, i2) {
			if (linkageDataExists(t1, t2, "Coupling") || linkageDataExists(t1, t2, "Repulsion")) {
				couplingData = rawLinkageData[t1][t2]["Coupling"];
				repulsionData = rawLinkageData[t1][t2]["Repulsion"];
				overall_pea_count += d3.sum(couplingData);
				overall_pea_count += d3.sum(repulsionData);

				crossoverValue = computeMorganDistance(couplingData, repulsionData)
				if (crossoverValue > max_val) {
					max_val = crossoverValue;
				}
				crossoverData[i1].push({
					trait: t1,
					comparison_trait: t2,
					crossover_distance: crossoverValue
				});

				if (t1[0] === t1[1]) {
					//they are the same trait.
				}
				else {
					crossover_unlinked_values.push(crossoverValue);
				}
			}
		});
	});
	max_crossover_value = max_val;
	overall_pea_count/=2; //each is doubled
	unlinked_morganDistance_SD = d3.deviation(crossover_unlinked_values);
	// console.log("Standard deviation is " + unlinked_morganDistance_SD);

	// console.log(crossoverData);
}

let getCircularPositions = function(numItems, radius, center) {
	let anglePer = (2 * Math.PI) / (numItems);
	let startAngle = 0;
	let startPositions = [];
	for (let i = 0; i < numItems; i++) {
		//position on circle = [center[0] + r*cos(theta), center[1] + r*sin(theta))
		angle = anglePer*i;
		xStart = center[0] + radius * Math.cos(angle);
		yStart = center[1] + radius * Math.sin(angle);
		startPositions.push([xStart, yStart]);
	}
	//shuffle to avoid similar colours next to each other
	return d3.shuffle(startPositions); 
}


let setupClusteringSmallMultiples = function(clustering_group) {

	console.log("smallMultiplePositionsCached is " + smallMultiplePositionsCached);
	if (!smallMultiplePositionsCached) {
		let circularPositions = getCircularPositions(crossoverData.length, 300, [300, 300]);
		traits.forEach(function(d, i) {
			smallMultiplePositions[d] = circularPositions[i];
		});
	}
	clustering_group.append("text")
		.attr("transform", "translate(" + (clustering_marginnedWidth/2) + ", " + (-20) + ")")
		.attr("class", "title")
		.text("Grouping Traits")
		.attr("text-anchor", "middle")
		.style("font", "20px times")
		.style("text-decoration", "underline");

	smallMultiplePositionsCached = false;

	smallMultipleWidth = 210;
	smallMultipleHeight = 150;
	graphWidth = 190;
	graphHeight = 90;
	xAxisHeightPermitted = 10;

	xAxis_xPos = 10;
	xAxis_yPos = graphHeight + xAxisHeightPermitted;
	titleHeight = 30;
	graphBorder = 10;

	xDomain = ([0, max_crossover_value]);
	let x = d3.scaleLinear()
		.domain(xDomain) //crossoverValue
		.range([0, graphWidth]) //position on graph

	let y = d3.scaleLinear()
		.domain([0, 17]) //index of trait
		.range([0, graphHeight]); 


	crossoverSmallMultiples = clustering_group.selectAll(".crossoverSmallMultiple")
		.data(crossoverData)
		.enter()
		.append("g")
			.attr("class", function(d) {
				return "crossoverSmallMultiple";
			})
			.attr("transform", function(d, i) {
				let trait = d[0]["trait"];
				return "translate(" + smallMultiplePositions[trait][0] + ", " + smallMultiplePositions[trait][1] + ")";
			})
			.on("mouseover", function() {
				d3.select(this).raise();
			});

	titles = crossoverSmallMultiples.append("g")
		.attr("class", "smallMultipleTitle")
		.attr("transform", "translate(0, 0)");
	titles.append("rect")
		.attr("class", "box")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", smallMultipleWidth)
		.attr("height", titleHeight)
		.style("fill", lightFillColour);
	
	titles.append("circle")
		.style("fill", function(d, i) {
			return traitColorer(d[0]["trait"]);
		})
		.attr("cx", 15)
		.attr("cy", 15)
		.attr("r", 10);

	titles.append("text")
		.attr("transform", "translate(30, 20)")
		.text(function(d) {
			let trait = d[0]["trait"]
			let full_descr = descriptionData[trait]["Short_Descr"]
			return full_descr;
		});

	graphAreas = crossoverSmallMultiples.append("g")
		.attr("class", "smallMultipleGraph")
		.attr("transform", "translate(" + graphBorder + "," + (titleHeight+graphBorder) + ")");
	graphAreas.append("rect")
		.attr("class", function(d) {
			let trait = d[0]["trait"]
			let type = getClassNameFromDescription(descriptionData[trait]["Short_Descr"]);
			return "errorIndicator " + type + " intersectionArea";
		})
		.attr("x", -graphBorder)
		.attr("y", -graphBorder)
		.attr("width", graphWidth+2*graphBorder)
		.attr("height", graphHeight + 2*graphBorder)
		.attr("stroke", d3.rgb(150,150,150))
		.style("fill", d3.rgb(255, 255, 255))
		.on("mouseover", function() {
			d3.select(this)
				.style("fill", d3.rgb(255, 255, 255));
		})


	graphAreas.selectAll("circle")
		.data(function(d) { 
			return d;
		})
		.enter()
		.append("circle")
			.attr("cx", function(d) {
				return x(d["crossover_distance"]);
			})
			.attr("cy", function(d) {
				return y(traits.indexOf(d["comparison_trait"]));
			})
			.attr("r", 10)
			.style("fill", function(d) {
				return traitColorer(d["comparison_trait"]);
			});

	graphAxes = graphAreas.append("g")
		.attr("class", "smallMultipleXAxis")
		.style("font", "12px times")
		.attr("transform", "translate(" + xAxis_xPos + ", " + xAxis_yPos + ")")
		.call(
			d3.axisBottom(x)
			.ticks(5)
			.tickFormat(function(d) {
				return d*100;
			}));

	graphAreas.append("text")
			.attr("transform", "translate(" + smallMultipleWidth/2 + ", " + (smallMultipleHeight-20) + ")")
			.attr("text-anchor", "middle")
			.text("Crossover %");


	dragHandler(clustering_group.selectAll(".crossoverSmallMultiple"));



	let clearSmallMultiples = function() {
		//remember the positions
		clustering_group.selectAll(".crossoverSmallMultiple")
			.each(function(d) {
				let trait = d[0]["trait"];
				var current = d3.select(this);
				let transform = current.attr("transform").split("(");
				let obj_x = transform[1].split(",")[0];
				let obj_y = transform[1].split(",")[1].split(")")[0];
				smallMultiplePositions[trait] = [obj_x, obj_y];
			});
		smallMultiplePositionsCached = true;

	}

	resetStage_instrs.push(clearSmallMultiples)

}

function clustering_checkCompletion() {
	let title_positions = []
	let target_no_intersections = 40; // 20, but each happens both ways
	let no_intersections = 0;
	let failure = false;

	d3.selectAll(".errorIndicator")
		.style("fill", noFailureFillColour);

	let smallMultipleBoxes = d3.selectAll(".intersectionArea")
	// let smallMultipleTitles = d3.selectAll(".smallMultipleTitle .box")
		.each(function(d) {

			let sm_transform = d3.select(this.parentNode.parentNode).attr("transform")
			let sm_xStart = +sm_transform.split("(")[1].split(",")[0];
			let sm_yStart = +sm_transform.split("(")[1].split(",")[1].split(")")[0];
			let box = d3.select(this);
			let box_xMin = sm_xStart + +box.attr("x")
			let box_xMax = box_xMin + +box.attr("width");
			let box_yMin = sm_yStart + +box.attr("y")
			let box_yMax = box_yMin + +box.attr("height");

			title_positions.push(
				{ 
					xMin: box_xMin, 
					xMax: box_xMax, 
					yMin: box_yMin, 
					yMax: box_yMax, 
					trait: d[0]["trait"]
				});
			
		});

	title_positions.forEach(function(t1_pos) {
		title_positions.forEach(function(t2_pos) {
			//check if they intersect:
			if (t1_pos.trait === t2_pos.trait) {
				return; //(continues)
			}
			intersect = checkIntersection(t1_pos, t2_pos);
			if (intersect) {
				no_intersections++;
				console.log("Intersection between " + t1_pos.trait + ", and " + t2_pos.trait);
				if (checkSameChromosome(t1_pos, t2_pos)) {
					//continue
				}
				else {
					//fail
					console.log("clustering FAILURE between: " + t1_pos.trait + ", and " + t2_pos.trait);
					failure = true;
					let t1_id = descriptionData[t1_pos.trait]["Short_Descr"]
					let t2_id = descriptionData[t2_pos.trait]["Short_Descr"]

					let t1_classSelector = ".errorIndicator." + getClassNameFromDescription(t1_id);
					let t2_classSelector = ".errorIndicator." + getClassNameFromDescription(t2_id);

					// console.log("Attempting to select class with: " + t1_classSelector);
					// console.log("Attempting to select class with: " + t2_classSelector);

					d3.selectAll(t1_classSelector)
						.style("fill", failureFillColour);
					d3.selectAll(t2_classSelector)
						.style("fill", failureFillColour);

				}
			}
		});
	});
	if (!failure) {
		if (no_intersections == target_no_intersections) {
			console.log("clustering is complete SUCCESFULLY!");
			d3.selectAll(".errorIndicator")
				.style("fill", successFillColour);
			return true;
		}
		else {
			console.log("Not enough intersections");
			console.log("no intersections is currently" + no_intersections);
			return false;
		}
	}
	else {
		console.log("Not all links were correct");
		return false;
	}

	//if got this far then did not fail!
	return true;
}

function checkSameChromosome(t1_pos, t2_pos) {
	if (t1_pos.trait[0] === t2_pos.trait[0]) {
		return true;
	}
	else {
		return false;
	}
}

function checkIntersection(t1_pos, t2_pos) {
	//must intersect in X and Y
	let xIntersect = false;
	let yIntersect = false;
	if (t1_pos.xMax >= t2_pos.xMin) {
		//furthest point must be at least past the least furthest point
		if (t2_pos.xMax >= t1_pos.xMin) {
			//vice versa
			//then they do intersect
			xIntersect = true;
		}
	}
	//same for y
	if (t1_pos.yMax >= t2_pos.yMin) {
		if (t2_pos.yMax >= t1_pos.yMin) {
			yIntersect = true;
		}
	}

	if (yIntersect && xIntersect) {
		return true;
	}
	else {
		return false;
	}
}

let setupLinkageMapGroup = function(svg) {
	let linkageMapOuterGroup = svg.append("g")
		.attr("transform", "translate(0," + nav_offset_Y + ")")
		.attr("width", linkageMap_width)
		.attr("height", linkageMap_height)

	let linkageMapGroup = linkageMapOuterGroup.append("g")
		.attr("transform", "translate(" + linkageMap_margin.left + "," + linkageMap_margin.top + ")")
	linkageMapGroup.append("rect")
		.attr("x", -linkageMap_margin.left)
		.attr("y", -linkageMap_margin.top)
		.attr("width", linkageMap_width)
		.attr("height", linkageMap_height)
		.style("fill", d3.rgb(255, 255, 255))
		.attr("stroke", d3.rgb(150,150,150));
	let removeLinkageMapGroup = function() {
		linkageMapOuterGroup.remove();
	}
	resetStage_instrs.push(removeLinkageMapGroup);
	return linkageMapGroup;
}

let setupLinkageMap = function(linkageMap_group) {

	let legendTitleHeight = 20;
	let legendHeight = 140;
	let titleHeight = 30;
	let legendWidth = 400;
	let mapWidth = linkageMap_marginnedWidth*0.7;
	let mapHeight = linkageMap_height-(legendHeight+titleHeight+legendTitleHeight);
	let dataSizeXBorder = 30;
	let dataSizeYBorder = 80;
	let dataSizeWidth = linkageMap_marginnedWidth-mapWidth;
	let dataSizeHeight = linkageMap_height-2*dataSizeYBorder;
	let axisWidth = 50;
	let axisHeight = 50;


	let legendYBorder = 15;
	let linkageMapGraph = linkageMap_group.append("g")
		.attr("class", "linkageMapGraph")
		.attr("transform", "translate(0," + (legendHeight+titleHeight) + ")");
	let linkageMapLegend = linkageMap_group.append("g")
		.attr("class", "linkageMapLegend")
		.attr("transform", "translate(" + ((mapWidth-legendWidth)/2) +
			", " + 0 + ")")

	let linkageMapTitle = linkageMap_group.append("text")
		.attr("class", "linkageMapGraphTitle")
		.attr("transform", "translate(" + (mapWidth/2) +
			", " + (legendHeight + (titleHeight/2)) + ")")
		.style("text-anchor", "middle")
		.style("font", "20px times")
		.style("text-decoration", "underline")
		.text("Sweet Pea Genetic Linkage Map");

	linkageMapLegend.append("rect")
		.attr("x", 0)
		.attr("y", 15)
		.attr("width", legendWidth)
		.attr("height", legendHeight-30)
		.attr("fill", lightFillColour)
		.attr("stroke", borderColour);

	linkageMapGraph.append("rect")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", mapWidth)
		.attr("height", mapHeight)
		.attr("stroke", borderColour)
		.style("fill", d3.rgb(255, 255, 255));

	let updateLinkageMapLegend = function(chromosome, locations) {
		d3.selectAll(".linkageMap_legendItem").remove();
		// let chromosome_index = linkageMap_chromosome_indices[chromosome]
		// let chromosome_data = linkageMapData[chromosome_index];
		legendItems = linkageMapLegend.selectAll(".linkageMap_legendItem")
			.data(locations)
			.enter()
			.append("g")
				.attr("class", "linkageMap_legendItem")

		let yPer = (legendHeight-2*legendYBorder)/5;
		let getHeight = function(index) {
			return legendYBorder+yPer/2+(yPer*index);
		}
		let getTextHeight = function(index) {
			return getHeight(index) + 0.2*yPer
		}
		legendItems.append("circle")
			.attr("cx", 20)
			.attr("cy", function(d, i) {
				return getHeight(i);
			})
			.attr("r", 0.4*yPer)
			.style("fill", function(d) {
				return traitColorer(d["trait_id"])
			});
		legendItems.append("text")
			.attr("transform", function(d, i) {
				return "translate(" + (20+yPer) + "," + getTextHeight(i) + ")";
			})
			.text(function(d) {
				return descriptionData[d["trait_id"]]["Full_Descr"]
			})

	}

	xDomain = []
	traits.forEach(function(t) {
		let firstLetter = t[0];
		if (xDomain.indexOf(firstLetter) == -1) {
			//it's a new letter, add it.
			xDomain.push(firstLetter);
		}
		xDomain.sort();
	});

	let x = d3.scaleBand()
		.domain(xDomain)
		.range([axisWidth, mapWidth]);

	let y = d3.scaleLinear()
		.domain([-0.55, 0.55])
		.range([0, mapHeight-axisHeight]);

	chromosomeLinkageMaps = linkageMapGraph.selectAll(".chromosomeLinkageMap")
		.data(linkageMapData)
		.enter()
		.append("g")
		.attr("class", "chromosomeLinkageMap")

	chromosomeLinkageMaps.append("rect")
		.attr("x", function(d) {
			return x(d["chromosome"])-x.bandwidth()/2;
		})
		.attr("y", 0)
		.attr("width", x.bandwidth())
		.attr("height", mapHeight)
		.on("mouseover", function(d) {
			// console.log("Updating the legend for chromosome:" + d["chromosome"]);
			updateLinkageMapLegend(d["chromosome"], d["locations"]);
		})
		.style("fill", d3.rgb(255, 255, 255));

	chromosomeLinkageMaps.append("line")
		.attr("x1", function(d) {
			if (d["chromosome"] === "A") {
				updateLinkageMapLegend(d["chromosome"], d["locations"]);
			}
			return x(d["chromosome"]);
		})
		.attr("x2", function(d) {
			return x(d["chromosome"])
		})
		.attr("y1", y(-0.55))
		.attr("y2", y(0.55))
		.attr("stroke", d3.rgb(0,0,0))
		.attr("stroke-width", 5)

	chromosomeLinkageMaps.selectAll(".chromosomeLinkageMapTrait")
		.data(function(d) {
			return d["locations"];
		})
		.enter()
		.append("circle")
			.attr("cx", function(d) {
				return x(d["trait_id"][0])
			})
			.attr("cy", function(d) {
				return y(d["pos"])
			})
			.attr("r", 15)
			.style("fill", function(d) {
				return traitColorer(d["trait_id"]);
			})
			.on("mouseover", function() {
				d3.select(this).raise();
			});

	linkageMapChromosomeAxis = linkageMapGraph.append("g")
		.attr("class", "linkageMap_xAxis")
		.attr("transform", "translate(" + (-axisWidth+12) + ", " + (mapHeight-((3/4)*axisHeight)) + ")")
		.call(d3.axisBottom(x));

	let yAxis_startX = axisWidth/2;
	let yAxis_startY = 0;//(mapHeight-axisHeight)/2;
	let yAxis = linkageMapGraph.append("g")
		.attr("class", "linkageMap_yAxis")
		.attr("transform", "translate(" + yAxis_startX + ", " + yAxis_startY + ")")
		.call(d3.axisLeft(y))

	let yAxis_labelX = -10;
	let yAxis_labelY = (mapHeight-axisHeight)/2;
	let axis_label = linkageMapGraph.append("text")
		.attr("x", yAxis_labelX)
		.attr("y", yAxis_labelY)
		.attr("transform", "rotate(-90, " + yAxis_labelX +"," + yAxis_labelY +")")

		// .attr("transform", "translate(" + yAxis_labelX + ", " + yAxis_labelY + ")"
		// 	" rotate(-90," + yAxis_labelX + ", " + yAxis_labelY + ")")
		.text("Genetic Distance /cM")
		.attr("text-anchor", "middle")
		// .text("");

	showDataSize = function() {
		showDataSize_bool = true;
		
		let barColours = [d3.rgb(120,60,0), d3.rgb(255,190,100, 0.8)]; //brown, peach
		let barLabels = ["Sweet Peas", "Humans"];
		let dataSizeComp_group = linkageMap_group.append("g")
			.attr("class", "sizeComparisonChart")
			.attr("transform", "translate(" + (mapWidth+dataSizeXBorder) + "," + dataSizeYBorder + ")")
		
		dataSizeComp_group.append("text")
			.attr("transform", "translate(" + (dataSizeWidth/2) + 
				", " + (-(dataSizeYBorder*(1/4))) + ")")
			.attr("text-anchor", "middle")
			.style("font", "16px times")
			.style("text-decoration", "underline")
			.text("Count of Control-Bred Specimens by Species");
		dataSizeComp_group.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", dataSizeWidth)
			.attr("height", dataSizeHeight)
			.attr("stroke", borderColour)
			.style("fill", lightFillColour);

		let yAxis_width = 50;
		let xAxis_height = 50;
		let barTopBorder = 15;
		let max_bar_height = (dataSizeHeight-xAxis_height)-barTopBorder;
		let dataSizeXScale = d3.scaleBand()
			.domain(barLabels)
			.range([0, dataSizeWidth - yAxis_width])
			.padding(0.5)
		let dataSizeYScale = d3.scaleLinear()
			.domain([overall_pea_count, 0])
			.range([-max_bar_height, 0])
		dataSize_data = [overall_pea_count, 0];

		//y 0 is at dataSizeHeight-xAxis_height
		//starting position is the height, up from there
		//dataSizeYScale converts (500k, 0) --> [-max_bar_height, 0]
		//for a graph size 0, we need to pass in: 0
		//Y is then: max_bar_height - dataSizeYScale
		dataSizeComp_group.selectAll(".dataCount_bar")
			.data(dataSize_data)
			.enter()
				.append("rect")
				.attr("class", "dataCount_bar")
				.attr("x", function(d, i) {
					return yAxis_width+dataSizeXScale(barLabels[i]);
				})
				.attr("y", function(d) {
					let y = max_bar_height+dataSizeYScale(d)+barTopBorder;
					return y;
				})
				.attr("width", dataSizeXScale.bandwidth())
				.attr("height", function(d) {
					return -dataSizeYScale(d)
				})
				.style("fill", function(d, i) {
					return barColours[i];
				})
		let dataSizeXAxis = dataSizeComp_group.append("g")
			.attr("class", "xAxis")
			.attr("transform", "translate(" + yAxis_width + ", " + (dataSizeHeight-xAxis_height) + ")")
			.call(d3.axisBottom(dataSizeXScale));

		let dataSizeYAxis = dataSizeComp_group.append("g")
			.attr("class", "yAxis")
			.attr("transform", "translate(" + (yAxis_width*(7/8)) +
				", " + (dataSizeHeight-xAxis_height) + ")")
			.call(
				d3.axisLeft(dataSizeYScale)
					.ticks(8)
					.tickFormat(function(d) {
						if (d >= 1000) {
							return (d/1000) + "K";
						}
						else {
							return d;
						}
					}));

		return true;
	}

	if (showDataSize_bool) {
		showDataSize();
	}


	let clearLinkageMap = function() {
		linkageMap_group.remove()
	}

	resetStage_instrs.push(clearLinkageMap)
}


let setupTimeGraphGroup = function(svg) {
	let timeGroupOuter = svg.append("g")
		.attr("transform", "translate(0," + nav_offset_Y + ")")
		.attr("width", time_width)
		.attr("height", time_height);
	let timeGroup = timeGroupOuter.append("g")
		.attr("transform", "translate(" + time_margin.left + "," + time_margin.top + ")")
	timeGroup.append("rect")
		.attr("x", -time_margin.left)
		.attr("y", -time_margin.top)
		.attr("width", time_width)
		.attr("height", time_height)
		.style("fill", d3.rgb(255, 255, 255))
		.attr("stroke", d3.rgb(150,150,150));
	let removeTimeGroup = function() {
		timeGroupOuter.remove();
	}
	resetStage_instrs.push(removeTimeGroup);
	return timeGroup;
}

let drawTimeGraph = function(timeGroup) {

	let timeGraphWidth = time_marginnedWidth;
	let timeGraphHeight = time_marginnedHeight;

	let eventColourer = d3.scaleOrdinal(d3.schemeCategory10);

	let yearData = [];
	yearData = yearData.concat(mutation_time_data.map(function(d) {
		return d["Year"];
	}));
	yearData = yearData.concat(importantEvents_data.map(function(d) {
		return d["Year"];
	}));
	let cumulative_mutationData = mutation_time_data.map(function(d) {
		return d["cumulativeTotal"];
	});

	let eventIDs = importantEvents_data.map(function(d) {
		return d["ID"];
	})

	let timeScale = d3.scaleTime()
		.domain(d3.extent(yearData))
		.range([0, timeGraphWidth]);

	let yScale_mutations = d3.scaleLinear()
		.domain(d3.extent(cumulative_mutationData))
		.range([timeGraphHeight, 0])
		.nice();

	let yScale_events = d3.scaleBand()
		.domain(eventIDs)
		.range([timeGraphHeight, 0]);

	let lineGraphGroup = timeGroup.append("g")
		.attr("class", "time_graph")
		.attr("transform", "translate(0,0)");

	let mutationTime_dataPoints = lineGraphGroup.selectAll(".time_data_point")
		.data(mutation_time_data)
		.enter()
		.append("g")
			.attr("class", "mutation_time_data_point")

	mutationTime_dataPoints.append("circle")
		.attr("cx", function(d) {
			return timeScale(d["Year"]);
		})
		.attr("cy", function(d) {
			return yScale_mutations(d["cumulativeTotal"])
		})
		.attr("r", 3)
		.style("fill", d3.rgb(0,0,0));

	mutationTime_dataPoints.append("line")
		.attr("x1", function(d) {
			return timeScale(d["Year"]);
		})
		.attr("y1", function(d) {
			return yScale_mutations(d["cumulativeTotal"])
		})
		.attr("x2", function(d) {
			return timeScale(d["Year"]-1);
		})
		.attr("y2", function(d) {
			return yScale_mutations(d["cumulativeTotal"] - d["Mutations_found"]);
		})
		.attr("stroke-width", 2)
		.style("stroke", d3.rgb(0,0,0));



	timeAxis = lineGraphGroup.append("g")
		.attr("class", "timeAxis")
		.style("font", "12px times")
		.attr("transform", "translate(0,"+ yScale_mutations(0) + ")")
		.call(
			d3.axisBottom(timeScale)
			.ticks(30)
			.tickFormat(d3.format("d")));

	mutationAxis = lineGraphGroup.append("g")
		.attr("class", "mutationAxis")
		.style("font", "12px times")
		.attr("transform", "translate(" + timeScale(2018) + "," + 0 + ")")
		.call(d3.axisRight(yScale_mutations)
			.ticks(13)
			.tickFormat(function(d) {
				return (d/1000) + "K";
			}));

	timeLabel = lineGraphGroup.append("text")
		.attr("transform", "translate(" + (timeGraphWidth/2) + "," + (timeGraphHeight+40) + ")")
		.style("font", "18px times")
		.text("Year");

	let mutationlabelX = timeGraphWidth+60;
	let mutationLabelY = timeGraphHeight/2;
	let mutationLabel = lineGraphGroup.append("text")
		.attr("x", mutationlabelX)
		.attr("y", mutationLabelY)
		.attr("transform", "rotate(-90, " + mutationlabelX +"," + mutationLabelY +")")
		.text("HMGD Total Human Mutations")
		.style("font", "18px times")
		.attr("text-anchor", "middle")

	let mutationTitle = lineGraphGroup.append("text")
		.attr("transform", "translate(" + (0.82*timeGraphWidth) + ", " + (timeGraphHeight+65) + ")")
		.style("font", "20px times")
		.attr("text-anchor", "middle")
		.text("Human Disease-Causing Mutations Identified by Time")
		.style("text-decoration", "underline");


	let time_title = lineGraphGroup.append("text")
		.attr("transform", "translate(" + (timeGraphWidth/2) + ", " + 0 + ")")
		.style("font", "20px times")
		.text("Genesis to Genomics: Key events through Genetic Linkage")
		.style("text-decoration", "underline")
		.attr("text-anchor", "middle");

	let eventTime_dataPoints = lineGraphGroup.selectAll(".event_data_point")
		.data(importantEvents_data)
		.enter()
		.append("g")
			.attr("class", "event_data_point")

	let eventLines = eventTime_dataPoints
		.filter(function(d) {
			return !(+d["PrevIDYear"] == 0);
		})
		.append("line")
		.attr("class", "eventJoiner")
		.attr("x1", function(d) {
			return timeScale(d["Year"]);
		})
		.attr("y1", function(d) {
			return yScale_events(d["ID"]);
		})
		.attr("x2", function(d) {
			return timeScale(d["PrevIDYear"]);
		})
		.attr("y2", function(d) {
			return yScale_events(d["ID"]);
		})
		.attr("stroke-width", 3)
		.attr("stroke", function(d) {
			return eventColourer(d["ID"]);
		});

	let eventCircles = eventTime_dataPoints.append("circle")
		.attr("class", "eventPoint")
		.attr("cx", function(d) {
			return timeScale(d["Year"]);
		})
		.attr("cy", function(d) {
			return yScale_events(d["ID"]);
		})
		.attr("r", function(d) {
			return 15;
		})
		.style("fill", function(d) {
			return eventColourer(d["ID"])
		});

	


	let eventAxis = lineGraphGroup.append("g")
		.attr("class", "eventAxis")
		.attr("transform", "translate(0,0)")
		.call(
			d3.axisLeft(yScale_events)
			.tickValues([]));
	let eventLabelX = -20;
	let eventLabelY = timeGraphHeight/2;

	let eventLabel = lineGraphGroup.append("text")
		.attr("x", eventLabelX)
		.attr("y", eventLabelY)
		.attr("transform", "rotate(-90, " + eventLabelX +"," + eventLabelY +")")
		.text("Genetics Timeline Events")
		.style("font", "18px times")
		.attr("text-anchor", "middle")



	eventCircles.on("mouseover", function(d) {

		eventCircles.style("opacity", 0.4);
		eventLines.style("opacity", 0.4);

		let element = d3.select(this);
		element.style("opacity", 1);
		let circX = +element.attr("cx");
		let circY = +element.attr("cy");
		let tooltip_width = 300;
		let tooltip_height = 125;
		let text_border = 2
		let xStart = 0;
		let yStart = 0;
		if ((circX + tooltip_width <= timeGraphWidth) && (circY - tooltip_height >= 0)) {
			xStart = circX-20;
			yStart = (circY-20)-tooltip_height;
		}
		else {
			xStart = (circX-20)-tooltip_width;
			yStart = circY+20;
		}
		let tooltip = lineGraphGroup.append("g")
			.attr("class", "event_tooltip")
		tooltip.append("rect")
			.attr("x", xStart)
			.attr("y", yStart)
			.attr("width", tooltip_width)
			.attr("height", tooltip_height)
			.attr("stroke", borderColour)
			.style("fill", eventColourer(d["ID"]))
			.style("opacity", 0.4);
			// 	console.log("colour is " + col);
			// 	col.opacity = 0.2;
			// 	console.log("Well now, colour is " + col);
			// 	return col;
			// });

		tooltip.append("text")
			.attr("transform", "translate(" + (xStart+text_border) + ", " + (yStart+text_border*8) + ")")
			.attr("class", "tooltip_text")
			.attr("dy", 0)
			.text(d["Year"] + " - " + d["Text"]);

		lineGraphGroup.selectAll(".tooltip_text")
			.call(wrap_text, tooltip_width-2*text_border);
	});


	eventCircles.on("mouseout", function(d) {
		d3.selectAll(".event_tooltip").remove();
		eventCircles.style("opacity",1);
		eventLines.style("opacity", 1);
	});

	let clearTimeGroup = function() {
		timeGroup.remove()
	}

	resetStage_instrs.push(clearTimeGroup);

}

let setupTimeData = function(hgmd_data, events_data) {
	mutation_time_data = [];
	importantEvents_data = [];
	let sorted_mutationData =  hgmd_data.sort(function(a, b) {
		//comparator
		if (a["Year"] < b["Year"]) {
			return -1;
		}
		else {
			return 1;
		}
	});

	let cumulativeTotal = 0;
	hgmd_data.forEach(function(d) {
		if (+d["Year"] > 2018) {
			//incomplete data
			return;
		}
		cumulativeTotal += +d["AllEntries"];
		mutation_time_data.push({
			"Year": +d["Year"],
			"Mutations_found": +d["AllEntries"],
			"cumulativeTotal": cumulativeTotal
		});
	});
	let id_eventYears = {};

	events_data.forEach(function(d) {
		let prevIDYear = 0;
		if (+d["ID"] in id_eventYears) {
			prevIDYear = id_eventYears[+d["ID"]];
		}
		importantEvents_data.push({
			"Year": +d["Year"],
			"Text": d["Event"],
			"ID": +d["ID"],
			"PrevIDYear": prevIDYear
		});
		id_eventYears[+d["ID"]] = +d["Year"];
	});
}

let svg = setupSVG();
let innerNavBarGroup = setupNavigationBarGroup(svg);
setupNavigationBar(innerNavBarGroup);

let innerInstructionGroup = setupInstructionGroup(svg);



d3.queue()
	.defer(d3.json, "data/punnett_data.json")
	.defer(d3.csv, "data/hgmd_totals.csv")
	.defer(d3.csv, "data/ImportantEvents.csv")
	.await(function(error, punnett_data, hgmd_data, events_data) {
		if (error) {
			console.log("Error: " + error);
			console.log(error);	
			return;
		}

		for (var key in punnett_data["descriptions"]) {
			traits.push(key);
		}
		d3.shuffle(traits);

		traits.forEach(function(t, i) {
			let letterCode = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[i];

			trait_visibleCodes[t] = letterCode;
		});

		traitColorer = traitColorer.domain(traits);

		rawLinkageData = punnett_data["linkage"];
		descriptionData = punnett_data["descriptions"];
		linkageMapData = punnett_data["linkage_map"];

		setupClusteringData();
		setupTimeData(hgmd_data, events_data);


		let setup_traitComparison = function(svg) {
			let initial_selectedTraits = ["A3", "B2"];

			let stackedBar_group = setupStackedBarGroup(svg);
			let traitSelection_group = setupTraitSelectionGroup(svg);
			// reset_instructions();
			// reset_commentary();
			drawSelectedTraitStackedBars(initial_selectedTraits, stackedBar_group);
			drawTraitSelectionBox(initial_selectedTraits, traitSelection_group, stackedBar_group);
		}


		let setup_clustering = function(svg) {
			let clustering_group = setupClusteringGroup(svg);

			setupClusteringSmallMultiples(clustering_group);
		}

		let setup_linkageMap = function(svg) {
			let linkageMap_group = setupLinkageMapGroup(svg);

			setupLinkageMap(linkageMap_group);
		}

		let setup_time = function(svg) {
			let time_group = setupTimeGraphGroup(svg);

			drawTimeGraph(time_group);
		}


		setupStage_instrs["Coupling"] = function() {
			setup_traitComparison(svg);
		};
		setupStage_instrs["Repulsion"] = function() {
			setup_traitComparison(svg);
		};
		setupStage_instrs["Clustering"] = function() {
			setup_clustering(svg);
		};
		setupStage_instrs["LinkageMap"] = function() {
			setup_linkageMap(svg);
		};
		setupStage_instrs["Time"] = function() {
			setup_time(svg);
		};

		getCommentary();
		getInstructions();
		setupStage_instrs["Coupling"]();


	});
