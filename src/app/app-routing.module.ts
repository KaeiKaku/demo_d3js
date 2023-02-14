import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BarChartComponent } from './bar_chart/bar-chart/bar-chart.component';
import { LineChartComponent } from './line_chart/line-chart/line-chart.component';

const routes: Routes = [
  { path: 'bar_chart', component: BarChartComponent },
  { path: 'line_chart', component: LineChartComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
