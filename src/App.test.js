import { render, screen, fireEvent, waitForElementToBeRemoved, waitFor } from '@testing-library/react';
import App from './App';

jest.setTimeout(20000);

describe('Test component', () => {
  test('Should find header', () => {
    render(<App />);
    const headerElement = screen.getByRole("heading");
    expect(headerElement).toBeInTheDocument();
  });

  test('Should find "upload big data" and "upload small data" buttons', async () => {
    render(<App />);
    expect(screen.getByRole("button", {name: "upload-big-data-button"})).toBeInTheDocument();
    expect(screen.getByRole("button", {name: "upload-small-data-button"})).toBeInTheDocument();
  });

  describe('Should handle button clicking', () => {
    //test big data upload
    test('Should upload big data', async () => {
      render(<App />);

      //load big amount of data
      fireEvent.click(screen.getByRole("button", {name: "upload-big-data-button"}));

      //loading icon must be displyed
      const loadingIcon = screen.getByRole("status");
      expect(loadingIcon).toBeInTheDocument();

      //table must be displyed after a while
      expect(await screen.findByRole("table", undefined, {timeout: 10000})).toBeInTheDocument();
      //loading icon must disappear
      expect(loadingIcon).not.toBeInTheDocument();
      //prev and next buttons must be displyed
      expect(screen.getByRole("button", {name: "table-header-prev-button"})).toBeInTheDocument();
      expect(screen.getByRole("button", {name: "table-header-next-button"})).toBeInTheDocument();
      expect(screen.getByRole("button", {name: "table-footer-prev-button"})).toBeInTheDocument();
      expect(screen.getByRole("button", {name: "table-footer-next-button"})).toBeInTheDocument();
      const
            table = screen.getByRole("table"),
            thId = screen.getAllByRole("columnheader")[0],
            cells = screen.getAllByRole("cell"),
            cellFirstValue = Number(cells[0].innerHTML),
            serachInput = screen.getByRole("search");

      //clicking any cell must open pearson additional info card
      fireEvent.click(cells[0]);
      expect(screen.getByText(/Выбран пользователь/)).toBeInTheDocument();

      //clicking next button must open the next page of pearsons data
      fireEvent.click(screen.getByRole("button", {name: "table-header-next-button"}));
      expect(Number(screen.getAllByRole("cell")[0].innerHTML)).toBeGreaterThan(cellFirstValue);
      //clicking prev button must open the previous page of pearsons data
      fireEvent.click(screen.getByRole("button", {name: "table-header-prev-button"}));
      expect(Number(screen.getAllByRole("cell")[0].innerHTML)).toEqual(cellFirstValue);

      //clicking a cell of table header must revense sorting by clicked parameter
      fireEvent.click(thId);
      expect(Number(screen.getAllByRole("cell")[0].innerHTML)).toBeGreaterThan(cellFirstValue);
      fireEvent.click(thId);
      expect(Number(screen.getAllByRole("cell")[0].innerHTML)).toEqual(cellFirstValue);

      //long data input may make the table disappear
      expect(serachInput).toBeInTheDocument();
      fireEvent.change(screen.getByRole("search"), {target: {value: 'a1b2c3'}});
      await waitForElementToBeRemoved(table).then(() =>{
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
      }, );

      //data input must change the length of the table
      fireEvent.change(screen.getByRole("search"), {target: {value: '100'}});
      await waitFor(() =>{
        expect(screen.getAllByRole("cell").length).toBeLessThan(cells.length);
      });


    });

    //test small data upload
    test('Should upload small data', async () => {
      render(<App />);

      //load big amount of data
      fireEvent.click(screen.getByRole("button", {name: "upload-small-data-button"}));

      //loading icon must be displyed
      const loadingIcon = screen.getByRole("status");
      expect(loadingIcon).toBeInTheDocument();

      //table must be displyed after a while
      expect(await screen.findByRole("table", undefined, {timeout: 2000})).toBeInTheDocument();
      //loading icon must disappear
      expect(loadingIcon).not.toBeInTheDocument();
      //prev and next buttons must be displyed because the table is too short
      expect(screen.queryByRole("button", {name: "table-header-prev-button"})).not.toBeInTheDocument();
      expect(screen.queryByRole("button", {name: "table-header-next-button"})).not.toBeInTheDocument();
      expect(screen.queryByRole("button", {name: "table-footer-prev-button"})).not.toBeInTheDocument();
      expect(screen.queryByRole("button", {name: "table-footer-next-button"})).not.toBeInTheDocument();
    });
  });
});