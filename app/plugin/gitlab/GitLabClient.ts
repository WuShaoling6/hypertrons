// Copyright 2019 Xlab
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { HostingClientBase } from '../../basic/HostingPlatform/HostingClientBase';
import { Gitlab } from 'gitlab';
import { CheckRun } from '../../basic/DataTypes';
import { GitLabConfig } from './GitLabConfig';

export class GitLabClient extends HostingClientBase<GitLabConfig, Gitlab> {

  protected updateData(): Promise<void> {
    return undefined as any;
  }

  public getFileContent(_path: string): Promise<string | undefined> {
    return undefined as any;
  }

  public addIssue(_title: string, _body: string, _labels?: string[] | undefined): Promise<void> {
    return undefined as any;
  }

  public addIssueComment(_number: number, _body: string): Promise<void> {
    return undefined as any;
  }

  public listLabels(): Promise<Array<{ name: string; description: string; color: string; }>> {
    return undefined as any;
  }

  public updateIssue(_number: number, _update: { title?: string | undefined; body?: string | undefined; state?: 'open' | 'closed' | undefined; }): Promise<void> {
    return undefined as any;
  }

  public updatePull(_number: number, _update: { title?: string | undefined; body?: string | undefined; state?: 'open' | 'closed' | undefined; }): Promise<void> {
    return undefined as any;
  }

  public updateIssueComment(_comment_id: number, _body: string): Promise<void> {
    return undefined as any;
  }

  public addLabels(_number: number, _labels: string[]): Promise<void> {
    return undefined as any;
  }

  public removeLabel(_number: number, _label: string): Promise<void> {
    return undefined as any;
  }

  public updateLabels(_labels: Array<{ current_name: string; name?: string | undefined; description?: string | undefined; color?: string | undefined; }>): Promise<void> {
    return undefined as any;
  }

  public createLabels(_labels: Array<{ name: string; description: string; color: string; }>): Promise<void> {
    return undefined as any;
  }

  public createCheckRun(_check: CheckRun): Promise<void> {
    return undefined as any;
  }

  public merge(_num: number): Promise<void> {
    return undefined as any;
  }

  public assign(_num: number, _login: string): Promise<void> {
    return undefined as any;
  }

}
