import { Component, ElementRef, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { selectAll } from 'd3';
import {
  DataGeneratorService,
  DummyData,
} from 'src/app/data-generator.service';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css'],
})
export class BarChartComponent implements OnInit {
  DataAll: DummyData[];
  DataCY: DummyData[] = [];
  DataAofCY: DummyData[] = [];

  constructor(private dataGen: DataGeneratorService) {
    this.DataAll = this.dataGen.generateDummyData();
    this.DataCY = this.dataGen.getData(this.DataAll, 'date', '2023-01-01');
    this.DataAofCY = this.dataGen.getData(this.DataAll, 'name', 'A');
  }

  ngOnInit(): void {
    const svg = d3
      .select('#bar_chart_container')
      .append('svg')
      .attr('width', this.dataGen.WIDTH)
      .attr('height', this.dataGen.HEIGHT)
      .classed('border', true);

    // pull data
    const nameSet = this.DataCY.map((d) => d.name);
    const valueSet = this.DataCY.map((d) => d.value);
    const innerWidth = this.dataGen.WIDTH - this.dataGen.INNER_MARGIN * 2;
    const innerHeight = this.dataGen.HEIGHT - this.dataGen.INNER_MARGIN * 2;
    const textGap = 10;

    // generate scale method
    const scaleX = d3
      .scaleBand()
      .domain(nameSet)
      .range([0, innerWidth])
      .padding(0.2);
    const scaleY = d3
      .scaleLinear()
      .domain([0, d3.max(valueSet) as number])
      .range([innerHeight, 0])
      .clamp(true)
      .nice();
    const colorScale = d3
      .scaleOrdinal()
      .domain(nameSet)
      .range(this.dataGen.COLORSET);

    // generate axis method
    const axisX = d3.axisBottom(scaleX);
    const axisXText = d3.axisBottom(scaleX);
    const axisY = d3.axisLeft(scaleY).ticks(20);
    // .tickSize(-this.dataGen.WIDTH + this.dataGen.INNER_MARGIN * 2);

    // draw rect
    const rect = svg
      .selectAll('rect')
      .data(this.DataCY)
      .join('rect')
      .attr('x', (d) => (scaleX(d.name) as number) + this.dataGen.INNER_MARGIN)
      .attr('y', (d) => this.dataGen.HEIGHT - this.dataGen.INNER_MARGIN)
      .attr('width', scaleX.bandwidth());

    // draw axis
    svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.dataGen.INNER_MARGIN},${
          this.dataGen.HEIGHT - this.dataGen.INNER_MARGIN
        })`
      )
      .call(axisX);
    svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.dataGen.INNER_MARGIN},${this.dataGen.INNER_MARGIN})`
      )
      .call(axisY);

    // draw text on axisX
    let groupAxisXText = svg
      .append('g')
      .attr(
        'transform',
        `translate(${this.dataGen.INNER_MARGIN},${
          this.dataGen.HEIGHT - this.dataGen.INNER_MARGIN
        })`
      )
      .call(axisXText)
      .selectAll('text')
      .data(this.DataCY)
      .join('text')
      .text((d) => 0)
      .attr('y', (d) => -textGap);

    (async () => {
      for (let index = 0; ; index++) {
        if (index > 0) {
          this.DataCY.forEach((d) => {
            d.value = d3.randomInt(1000000)();
          });
        }

        const transitionInner = d3
          .transition()
          .ease(d3.easeCubic)
          .duration(2000);

        // transition bar
        rect
          .transition(transitionInner)
          .attr('y', (d) => scaleY(d.value) + this.dataGen.INNER_MARGIN)
          .attr('height', (d) => innerHeight - scaleY(d.value))
          .attr('fill', (d) => colorScale(d.name) as string);

        // transition bar text
        groupAxisXText
          .transition(transitionInner)
          .attr('y', (d) => scaleY(d.value) - innerHeight - textGap)
          .tween('text', function (d) {
            let objThis = this as any;
            var i = d3.interpolate(objThis.textContent, d.value);
            return function (t) {
              d3.select(this).text((d) => d3.format('.0f')(i(t)));
            };
          });

        await transitionInner.end();
      }
    })();
  }
}
